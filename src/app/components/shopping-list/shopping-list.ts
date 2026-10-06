import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, forkJoin, of, Subject, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ShoppingListItem, ShoppingListResponse, ShoppingListService } from './shopping-list.service';
import { FOOD_CATEGORY_ORDER, FoodCategory, categoryTranslations } from '../../enums/food.enum';
import { currentWeek, shiftWeek, validWeek, weekLabel } from '../../utils/week';
import { RecipeService } from '../recipes/recipe.service';
import { WeeklyRecipePlanService } from '../weekly-recipe-plan/weekly-recipe-plan.service';

@Component({
    selector: 'shopping-list',
    imports: [CommonModule, FormsModule, RouterModule, NgbToast],
    templateUrl: './shopping-list.html',
    styleUrl: './shopping-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingList {

    private readonly planService = inject(WeeklyRecipePlanService);
    private readonly recipeService = inject(RecipeService);
    private readonly service = inject(ShoppingListService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    public readonly weekStart = signal(currentWeek());
    public readonly weekLabel = computed(() => weekLabel(this.weekStart()));
    public readonly editable = computed(() => this.weekStart() >= currentWeek());
    public readonly current = computed(() => this.weekStart() === currentWeek());
    public readonly canNext = computed(() => this.weekStart() < shiftWeek(currentWeek(), 1));
    public readonly items = signal<ShoppingListItem[]>([]);
    public readonly stores = signal<string[]>([...this.service.defaultStores]);
    public readonly viewMode = signal<'prepare' | 'shopping'>('prepare');
    public readonly selectedStoreIndex = signal(0);
    public readonly selectedStore = computed(() => this.stores()[this.selectedStoreIndex()] ?? this.stores()[0]);
    public readonly purchaseItems = computed(() => this.items().filter(item => !item.inStock && item.store === this.selectedStore()));
    public readonly purchaseGroups = computed(() => this.groupItems(this.purchaseItems()));
    public readonly purchaseCheckedCount = computed(() => this.purchaseItems().filter(item => item.checked).length);
    public readonly ready = signal(false);
    public readonly exists = signal(false);
    public readonly loading = signal(false);
    public readonly saving = signal(false);
    public readonly importing = signal(false);
    public readonly dirty = signal(false);
    public readonly errorMessage = signal('');
    public readonly saveMessage = signal('');
    public readonly importMessage = signal('');
    public readonly changedKeys = signal<string[]>([]);
    public readonly busy = computed(() => this.loading() || this.saving() || this.importing());
    public readonly checkedCount = computed(() => this.items().filter(item => item.checked && !item.inStock).length);
    public readonly shoppingItemCount = computed(() => this.items().filter(item => !item.inStock).length);
    public readonly shoppingGroupsByStore = computed(() => this.stores().map(store => ({ store, groups: this.groupItems(this.items().filter(item => !item.inStock && item.store === store)) })));
    public readonly stockGroups = computed(() => this.groupItems(this.items().filter(item => item.inStock)));
    public freeText = '';
    private readonly autoSave = new Subject<number | null>();

    constructor() {
        this.autoSave.pipe(
            switchMap(delay => delay === null ? EMPTY : timer(delay)),
            takeUntilDestroyed(),
        ).subscribe(() => this.saveShoppingList());
        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
            const week = params.get('week') ?? currentWeek();
            this.weekStart.set(validWeek(week) ? week : currentWeek());
            this.loadShoppingList(true);
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    public beforeUnload(event: BeforeUnloadEvent): void {
        if (this.dirty() || this.saving()) {
            event.preventDefault(); event.returnValue = '';
        }
    }

    public canDeactivate(): boolean {
        return !this.busy() && (!this.dirty() || window.confirm('Quitter sans sauvegarder les modifications de la liste de courses ?'));
    }

    public setViewMode(mode: 'prepare' | 'shopping'): void {
        if (!this.busy()) this.viewMode.set(mode);
    }

    public selectStore(index: number): void {
        if (!this.busy() && Number.isInteger(index) && index >= 0 && index < this.stores().length) {
            this.selectedStoreIndex.set(index);
        }
    }

    public changeWeek(offset: number): void {
        this.goWeek(shiftWeek(this.weekStart(), offset));
    }
    public goWeek(week = currentWeek()): void {
        if (this.busy() || !validWeek(week)) return;
        void this.router.navigate([], { relativeTo: this.route, queryParams: { week } });
    }

    public loadShoppingList(navigating = false): void {
        if (!navigating && this.dirty() && !window.confirm('Recharger et perdre les modifications non sauvegardées ?')) return;
        this.autoSave.next(null);
        this.ready.set(false);
        this.exists.set(false);
        this.loading.set(true);
        this.dirty.set(false);
        this.items.set([]);
        this.selectedStoreIndex.set(0);
        this.errorMessage.set('');
        this.saveMessage.set('');
        this.importMessage.set('');
        this.changedKeys.set([]);
        this.freeText = '';
        this.service.getRemoteList(this.weekStart()).subscribe({
            next: response => {
                this.showRemoteList(response); this.loading.set(false);
            },
            error: error => {
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    this.service.getPreferences().subscribe({
                        next: preferences => {
                            this.stores.set(preferences.stores); this.ready.set(true); this.loading.set(false);
                        },
                        error: failure => {
                            this.loading.set(false); this.errorMessage.set(this.describeError(failure));
                        },
                    });
                    return;
                }
                this.loading.set(false);
                this.errorMessage.set(this.describeError(error));
            },
        });
    }

    public saveShoppingList(): void {
        if (!this.editable() || !this.ready() || this.busy() || (!this.dirty() && this.exists())) return;
        this.autoSave.next(null);
        this.saving.set(true);
        this.errorMessage.set('');
        const items = this.items().map(item => ({
            itemKey: item.key,
            kind: item.kind,
            foodId: item.foodId,
            foodName: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            checked: item.checked,
            inStock: item.inStock,
            store: item.store,
        }));
        this.service.replaceRemoteList(this.weekStart(), { stores: this.stores(), items }).subscribe({
            next: response => {
                this.showRemoteList(response); this.saving.set(false); this.saveMessage.set('Liste sauvegardée.');
            },
            error: error => {
                this.saving.set(false);
                this.errorMessage.set(`${this.describeError(error)} Nouvelle tentative automatique dans 10 secondes.`);
                this.autoSave.next(10000);
            },
        });
    }

    public importIngredients(): void {
        if (this.viewMode() !== 'prepare' || !this.editable() || !this.ready() || this.busy()) return;
        this.importing.set(true);
        this.errorMessage.set('');
        this.planService.getByWeekStart(this.weekStart()).pipe(
            switchMap(plan => plan.items.length ? forkJoin(plan.items.map(item => this.recipeService.getDetailRecipe(item.recipeId).pipe(map(recipe => ({ recipe, servings: item.servings }))))) : of([])),
            map(entries => this.service.aggregateIngredients(entries)),
        ).subscribe({
            next: ingredients => {
                const merged = this.service.mergeIngredients(this.items(), ingredients, this.stores()[0]);
                this.items.set(merged.items);
                this.changedKeys.set(merged.changedKeys);
                this.markDirty();
                this.importMessage.set(`${merged.added} ajout(s), ${merged.changed} quantité(s) modifiée(s), ${merged.removed} retrait(s).`);
                this.importing.set(false);
                this.saveShoppingList();
            },
            error: error => {
                this.importing.set(false);
                this.errorMessage.set(error instanceof HttpErrorResponse && error.status === 404 ? 'Planning ou recette introuvable : aucun ingrédient importé.' : this.describeError(error));
            },
        });
    }

    public addFreeItem(): void {
        const name = this.freeText.trim();
        if (this.viewMode() !== 'prepare' || !name || name.length > 200 || !this.editable() || !this.ready() || this.busy()) return;
        this.items.update(items => [...items, { key: `free:${crypto.randomUUID()}`, kind: 'free', name, checked: false, inStock: false, store: this.stores()[0] }]);
        this.freeText = '';
        this.markDirty();
    }

    public editFreeItem(item: ShoppingListItem, event: Event): void {
        if (this.viewMode() !== 'prepare') return;
        const name = (event.target as HTMLInputElement).value.trim();
        if (name && name.length <= 200) this.updateItem(item, { name });
        else {
            (event.target as HTMLInputElement).value = item.name; this.errorMessage.set('Le libellé est obligatoire.');
        }
    }
    public removeFreeItem(item: ShoppingListItem): void {
        if (this.viewMode() !== 'prepare' || !this.editable() || !this.ready() || this.busy() || item.kind !== 'free') return;
        this.items.update(items => items.filter(entry => entry.key !== item.key));
        this.markDirty();
    }
    public toggleIngredient(item: ShoppingListItem, event: Event): void {
        if (item.inStock || (this.viewMode() === 'shopping' && item.store !== this.selectedStore())) return;
        this.updateItem(item, { checked: (event.target as HTMLInputElement).checked, inStock: false });
    }
    public moveToStock(item: ShoppingListItem, inStock: boolean): void {
        if (this.viewMode() !== 'prepare') return;
        this.updateItem(item, { inStock, checked: false });
    }
    public assignStore(item: ShoppingListItem, store: string): void {
        if (this.viewMode() !== 'prepare') return;
        if (this.stores().includes(store)) this.updateItem(item, { store });
    }
    public renameStore(store: string, event: Event): void {
        if (this.viewMode() !== 'prepare' || !this.editable() || !this.ready() || this.busy()) return;
        const input = event.target as HTMLInputElement;
        const name = input.value.trim();
        if (!name || name.length > 100 || this.stores().some(current => current !== store && current.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'))) {
            this.errorMessage.set('Les deux noms de magasins doivent être non vides et distincts.'); input.value = store; return;
        }
        this.stores.update(stores => stores.map(current => current === store ? name : current));
        this.items.update(items => items.map(item => item.store === store ? { ...item, store: name } : item));
        this.markDirty();
    }
    public quantityLabel(item: ShoppingListItem): string {
        if (item.kind === 'free') return item.name;
        const quantity = item.quantity ?? 0;
        const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(quantity);
        return item.unit === 'unité' ? `${formatted} ${item.name}` : `${formatted} ${item.unit} de ${item.name}`;
    }
    private showRemoteList(response: ShoppingListResponse): void {
        this.ready.set(true);
        this.exists.set(true);
        this.stores.set([...response.stores]);
        this.items.set(response.items.map(item => ({ key: item.itemKey, kind: item.kind, foodId: item.foodId, name: item.foodName, category: item.category, quantity: item.quantity, unit: item.unit, checked: item.checked, inStock: item.inStock, store: item.store })));
        this.dirty.set(false);
    }
    private updateItem(item: ShoppingListItem, changes: Partial<ShoppingListItem>): void {
        if (!this.editable() || !this.ready() || this.busy()) return;
        this.items.update(items => items.map(current => current.key === item.key ? { ...current, ...changes } : current));
        this.markDirty();
    }
    private markDirty(): void {
        this.dirty.set(true); this.saveMessage.set(''); this.errorMessage.set('');
        this.autoSave.next(3000);
    }
    private groupItems(items: ShoppingListItem[]) {
        const groups = new Map<FoodCategory | 'other', ShoppingListItem[]>();
        for (const item of items) {
            const category = item.kind === 'free' ? 'other' : item.category!;
            groups.set(category, [...groups.get(category) ?? [], item]);
        }
        const order: (FoodCategory | 'other')[] = [...FOOD_CATEGORY_ORDER, 'other'];
        return [...groups.entries()].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b)).map(([category, entries]) => ({
            category, label: category === 'other' ? 'Autres articles' : categoryTranslations[category], items: entries.sort((a, b) => a.name.localeCompare(b.name, 'fr')),
        }));
    }
    private describeError(error: unknown): string {
        return error instanceof HttpErrorResponse ? error.error?.message ?? 'Impossible de joindre le serveur.' : 'Une erreur est survenue.';
    }

}

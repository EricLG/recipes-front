import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ShoppingList } from './shopping-list';
import { ShoppingListService } from './shopping-list.service';
import { routes } from '../../app.routes';
import { FoodCategory } from '../../enums/food.enum';
import { RecipeCategory, RecipeStatus, RecipeVegetarianStatus } from '../../enums/recipes.enum';
import { DetailedRecipeDTO } from '../../models/recipe';
import { RecipeService } from '../recipes/recipe.service';
import { WeeklyRecipePlanService } from '../weekly-recipe-plan/weekly-recipe-plan.service';

function detailRecipe(): DetailedRecipeDTO {
    return {
        id: 'recipe-1',
        name: 'Soupe',
        status: RecipeStatus.APPROVED,
        instructions: '',
        vegetarianStatus: RecipeVegetarianStatus.FLEXIBLE,
        season: [],
        category: RecipeCategory.MAIN,
        servings: 4,
        imageUrl: '',
        recipeFoods: [
            {
                id: 'ingredient-1',
                recipeId: 'recipe-1',
                quantity: 100,
                food: {
                    id: 'potato',
                    name: 'Pomme de terre',
                    category: FoodCategory.STARCHES,
                    nutrientsPer100: {
                        energyKcal: 0,
                        proteins: 0,
                        fats: 0,
                        carbohydrates: 0,
                        sugars: 0,
                        fibers: 0,
                        salt: 0,
                        saturatedFattyAcids: 0,
                    },
                    needReview: false,
                    source: '',
                },
                measure: { id: 'gram', foodId: 'potato', label: 'g', grams: 1, isDefault: true },
            }
        ],
        recipeSubRecipes: [],
    };
}

describe('ShoppingList', () => {
    const api = { getRemoteList: vi.fn(), getPreferences: vi.fn(), replaceRemoteList: vi.fn() };
    const plans = { getByWeekStart: vi.fn() };
    const recipes = { getDetailRecipe: vi.fn() };
    let week: string;

    beforeEach(() => {
        vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
        vi.resetAllMocks();
        week = '2026-10-19';
        api.getRemoteList.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
        api.getPreferences.mockReturnValue(of({ stores: ['Marché', 'Bio'] }));
        api.replaceRemoteList.mockImplementation((date, body) => of({ weekStart: date, ...body }));
        plans.getByWeekStart.mockReturnValue(of({ items: [{ recipeId: 'recipe-1', servings: 4 }] }));
        recipes.getDetailRecipe.mockReturnValue(of(detailRecipe()));
    });
    afterEach(() => {
        vi.useRealTimers(); vi.restoreAllMocks();
    });

    function create() {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(), provideRouter([]),
                { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ week })) } },
                { provide: WeeklyRecipePlanService, useValue: plans },
                { provide: RecipeService, useValue: recipes },
            ],
        });
        const service = TestBed.inject(ShoppingListService);
        vi.spyOn(service, 'getRemoteList').mockImplementation(api.getRemoteList);
        vi.spyOn(service, 'getPreferences').mockImplementation(api.getPreferences);
        vi.spyOn(service, 'replaceRemoteList').mockImplementation(api.replaceRemoteList);
        const fixture = TestBed.createComponent(ShoppingList);
        fixture.detectChanges();
        return { component: fixture.componentInstance, fixture };
    }

    it('starts empty without importing or saving and uses personal stores', () => {
        const { component } = create();
        expect(component.items()).toEqual([]);
        expect(component.stores()).toEqual(['Marché', 'Bio']);
        expect(plans.getByWeekStart).not.toHaveBeenCalled();
        expect(api.replaceRemoteList).not.toHaveBeenCalled();
        component.freeText = 'Piles AA x4'; component.addFreeItem();
        expect(component.items()[0]).toMatchObject({ kind: 'free', name: 'Piles AA x4', store: 'Marché' });
        vi.advanceTimersByTime(3000);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
        expect(component.dirty()).toBe(false);
    });

    it('can explicitly save an empty list without a plan', () => {
        const { component } = create();
        expect(component.dirty()).toBe(false);
        component.saveShoppingList();
        expect(api.replaceRemoteList).toHaveBeenCalledWith(week, { stores: ['Marché', 'Bio'], items: [] });
        expect(component.exists()).toBe(true);
        expect(plans.getByWeekStart).not.toHaveBeenCalled();
    });

    it('displays recipe units and operates on different measures of the same food independently', () => {
        api.getRemoteList.mockReturnValue(of({ weekStart: week,
            stores: ['Marché', 'Bio'],
            items: [
                { itemKey: 'egg:unit', kind: 'ingredient', foodId: 'egg', foodName: 'Œufs', category: FoodCategory.STARCHES, quantity: 2, unit: 'unité', checked: false, inStock: false, store: 'Marché' },
                { itemKey: 'egg:gram', kind: 'ingredient', foodId: 'egg', foodName: 'Œufs', category: FoodCategory.STARCHES, quantity: 1200, unit: 'g', checked: false, inStock: false, store: 'Marché' },
            ] }));
        const { component, fixture } = create();
        expect(component.quantityLabel(component.items()[0])).toBe('2 Œufs');
        expect(component.quantityLabel(component.items()[1])).toContain('1 200 g');
        component.setViewMode('shopping');
        fixture.detectChanges();
        const rows = fixture.nativeElement.querySelectorAll('.purchase-row') as NodeListOf<HTMLLabelElement>;
        expect(rows).toHaveLength(2);
        rows[0].click();
        expect(component.items().filter(item => item.checked)).toHaveLength(1);
        const other = component.items().find(item => !item.checked)!;
        component.setViewMode('prepare');
        component.assignStore(other, 'Bio');
        component.moveToStock(other, true);
        expect(component.items().find(item => item.checked)).toMatchObject({ store: 'Marché', inStock: false });
        expect(component.items().find(item => item.key === other.key)).toMatchObject({ store: 'Bio', inStock: true, checked: false });
    });

    function loadPurchaseSnapshot() {
        api.getRemoteList.mockReturnValue(of({
            weekStart: week,
            stores: ['Marché', 'Bio'],
            items: [
                { itemKey: 'free:1', kind: 'free', foodName: 'Pain', store: 'Marché', checked: false, inStock: false },
                { itemKey: 'free:2', kind: 'free', foodName: 'Piles', store: 'Marché', checked: true, inStock: false },
                { itemKey: 'free:3', kind: 'free', foodName: 'Savon', store: 'Bio', checked: false, inStock: false },
                { itemKey: 'free:4', kind: 'free', foodName: 'Sel', store: 'Marché', checked: false, inStock: true },
            ],
        }));
    }

    it('shows one store without preparation controls and keeps checked rows in place', () => {
        loadPurchaseSnapshot();
        const { component, fixture } = create();
        component.setViewMode('shopping');
        fixture.detectChanges();
        const rows = () => Array.from(fixture.nativeElement.querySelectorAll('.purchase-row')) as HTMLLabelElement[];
        const originalOrder = rows().map(row => row.textContent);
        expect(rows()).toHaveLength(2);
        expect(component.purchaseCheckedCount()).toBe(1);
        expect(fixture.nativeElement.querySelector('.store-choices')).toBeNull();
        expect(fixture.nativeElement.querySelector('.stock-section')).toBeNull();
        expect(fixture.nativeElement.querySelector('#free-item')).toBeNull();
        expect(fixture.nativeElement.querySelector('fieldset')).toBeNull();
        rows()[0].click();
        fixture.detectChanges();
        expect(component.purchaseCheckedCount()).toBe(2);
        expect(rows().map(row => row.textContent)).toEqual(originalOrder);
        expect(component.items().find(item => item.name === 'Sel')?.inStock).toBe(true);
        expect(api.replaceRemoteList).not.toHaveBeenCalled();
        component.selectStore(1);
        fixture.detectChanges();
        expect(rows()).toHaveLength(1);
        expect(rows()[0].textContent).toContain('Savon');
        expect(component.purchaseCheckedCount()).toBe(0);
        component.selectStore(0);
        fixture.detectChanges();
        expect(component.purchaseCheckedCount()).toBe(2);
        expect(component.dirty()).toBe(true);
    });

    it('limits shopping mode to checking and automatically saves the full snapshot', () => {
        loadPurchaseSnapshot();
        const { component, fixture } = create();
        const original = component.items();
        component.setViewMode('shopping');
        component.assignStore(original[0], 'Bio');
        component.moveToStock(original[0], true);
        component.renameStore('Marché', { target: { value: 'Autre' } } as unknown as Event);
        component.editFreeItem(original[0], { target: { value: 'Autre' } } as unknown as Event);
        component.removeFreeItem(original[0]);
        component.freeText = 'Nouveau';
        component.addFreeItem();
        component.importIngredients();
        expect(component.items()).toEqual(original);
        expect(component.stores()).toEqual(['Marché', 'Bio']);
        expect(plans.getByWeekStart).not.toHaveBeenCalled();
        fixture.detectChanges();
        (fixture.nativeElement.querySelector('.purchase-row') as HTMLLabelElement).click();
        vi.advanceTimersByTime(3000);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
        const saved = api.replaceRemoteList.mock.calls[0][1];
        expect(saved.items).toHaveLength(4);
        expect(saved.items.find((item: { foodName: string }) => item.foodName === 'Pain').checked).toBe(true);
        expect(saved.items.find((item: { foodName: string }) => item.foodName === 'Sel').inStock).toBe(true);
        component.setViewMode('prepare');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.store-choices')).toBeTruthy();
        expect(component.dirty()).toBe(false);
    });

    it('keeps shopping history read-only and handles an empty store', () => {
        week = '2026-10-12';
        loadPurchaseSnapshot();
        const { component, fixture } = create();
        component.setViewMode('shopping');
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('.purchase-row input') as HTMLInputElement;
        expect(input.disabled).toBe(true);
        input.click();
        expect(component.purchaseCheckedCount()).toBe(1);
        component.items.set(component.items().filter(item => item.store !== 'Bio'));
        component.selectStore(1);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.purchase-empty').textContent).toContain('Bio');
        expect(component.dirty()).toBe(false);
    });

    it('assigns a store in one click for shopping and stock items', () => {
        const { component, fixture } = create();
        component.freeText = 'Piles';
        component.addFreeItem();
        fixture.detectChanges();
        const storeButtons = () => Array.from(fixture.nativeElement.querySelectorAll('.store-choices button')) as HTMLButtonElement[];
        storeButtons()[1].click();
        fixture.detectChanges();
        expect(component.items()[0].store).toBe('Bio');
        expect(storeButtons()[1].getAttribute('aria-pressed')).toBe('true');
        expect(fixture.nativeElement.querySelector('select')).toBeNull();
        expect(fixture.nativeElement.querySelector('#free-item').hasAttribute('placeholder')).toBe(false);
        component.moveToStock(component.items()[0], true);
        fixture.detectChanges();
        storeButtons()[0].click();
        fixture.detectChanges();
        expect(component.items()[0]).toMatchObject({ store: 'Marché', inStock: true });
        expect(storeButtons()[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('imports explicitly, preserves manual items and reports changes without duplication', () => {
        const { component } = create();
        component.freeText = 'Vêtements'; component.addFreeItem();
        component.importIngredients();
        const ingredient = component.items().find(item => item.kind === 'ingredient')!;
        component.assignStore(ingredient, 'Bio'); component.moveToStock(ingredient, true);
        component.importIngredients();
        expect(component.items()).toHaveLength(2);
        expect(component.items()[0]).toMatchObject({ quantity: 100, store: 'Bio', inStock: true });
        expect(component.importMessage()).toContain('0 ajout(s)');
        const changed = detailRecipe(); changed.recipeFoods[0].quantity = 200;
        recipes.getDetailRecipe.mockReturnValue(of(changed)); component.importIngredients();
        expect(component.items()[0]).toMatchObject({ quantity: 200, inStock: true, checked: false, store: 'Bio' });
        expect(component.changedKeys()).toContain(ingredient.key);
        plans.getByWeekStart.mockReturnValue(of({ items: [] })); component.importIngredients();
        expect(component.items()).toHaveLength(1);
        expect(component.items()[0].kind).toBe('free');
    });

    it('loads snapshots without implicit import and supports renaming and editing free text', () => {
        api.getRemoteList.mockReturnValue(of({ weekStart: week,
            stores: ['Super U', 'Biocoop'],
            items: [
                {
                    itemKey: 'free:1', kind: 'free', foodName: 'Piles', checked: true, inStock: false, store: 'Super U',
                }
            ] }));
        const { component } = create();
        component.renameStore('Super U', { target: { value: 'Marché' } } as unknown as Event);
        expect(component.items()[0].store).toBe('Marché');
        component.editFreeItem(component.items()[0], { target: { value: 'Piles AA' } } as unknown as Event);
        expect(component.items()[0].name).toBe('Piles AA');
        component.removeFreeItem(component.items()[0]);
        expect(component.items()).toEqual([]);
        expect(plans.getByWeekStart).not.toHaveBeenCalled();
    });

    it('retains unsaved work on failed save and asks before leaving', () => {
        const { component } = create();
        component.freeText = 'Piles'; component.addFreeItem();
        api.replaceRemoteList.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        component.saveShoppingList();
        expect(component.dirty()).toBe(true);
        expect(component.errorMessage()).toBeTruthy();
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        expect(component.canDeactivate()).toBe(false);
        const event = new Event('beforeunload', { cancelable: true }); component.beforeUnload(event as BeforeUnloadEvent);
        expect(event.defaultPrevented).toBe(true);
    });

    it('debounces edits and persists the latest store, stock and free items', () => {
        const { component, fixture } = create();
        component.freeText = 'Piles'; component.addFreeItem();
        vi.advanceTimersByTime(2000);
        component.assignStore(component.items()[0], 'Bio');
        vi.advanceTimersByTime(2000);
        component.moveToStock(component.items()[0], true);
        vi.advanceTimersByTime(2999);
        expect(api.replaceRemoteList).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
        expect(api.replaceRemoteList.mock.calls[0][1].items[0]).toMatchObject({ store: 'Bio', inStock: true });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('Sauvegarder');
        component.setViewMode('shopping'); fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('Sauvegarder');
    });

    it('saves imports immediately and cancels the pending debounced save', () => {
        const { component } = create();
        component.freeText = 'Piles'; component.addFreeItem();
        component.importIngredients();
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
        expect(component.dirty()).toBe(false);
        vi.advanceTimersByTime(3000);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
    });

    it('retains changes and automatically retries a failed save', () => {
        const { component } = create();
        api.replaceRemoteList.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
        component.freeText = 'Piles'; component.addFreeItem();
        vi.advanceTimersByTime(3000);
        expect(component.dirty()).toBe(true);
        expect(component.errorMessage()).toContain('Nouvelle tentative automatique');
        vi.advanceTimersByTime(10000);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(2);
        expect(component.dirty()).toBe(false);
        expect(component.errorMessage()).toBe('');
    });

    it('blocks concurrent edits during a save and cancels pending saves on destruction', () => {
        const { component, fixture } = create();
        const response = new Subject<never>();
        api.replaceRemoteList.mockReturnValue(response);
        component.freeText = 'Piles'; component.addFreeItem();
        vi.advanceTimersByTime(3000);
        expect(component.saving()).toBe(true);
        component.assignStore(component.items()[0], 'Bio');
        expect(component.items()[0].store).toBe('March\u00e9');
        response.error(new HttpErrorResponse({ status: 0 }));
        fixture.destroy();
        vi.advanceTimersByTime(10000);
        expect(api.replaceRemoteList).toHaveBeenCalledTimes(1);
    });

    it('dismisses the save toast after four seconds in either view', () => {
        const { component, fixture } = create();
        component.freeText = 'Piles'; component.addFreeItem();
        vi.advanceTimersByTime(3000);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast')?.textContent).toContain(component.saveMessage());
        component.setViewMode('shopping'); fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('ngb-toast')).toHaveLength(1);
        vi.advanceTimersByTime(3999); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast')).toBeTruthy();
        vi.advanceTimersByTime(1); fixture.detectChanges();
        expect(component.saveMessage()).toBe('');
        expect(fixture.nativeElement.querySelector('ngb-toast')).toBeNull();
    });

    it('dismisses the import summary toast after four seconds', () => {
        const { component, fixture } = create();
        component.importIngredients(); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast.text-bg-info')?.textContent).toContain('1 ajout(s)');
        vi.advanceTimersByTime(3999); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast.text-bg-info')).toBeTruthy();
        vi.advanceTimersByTime(1); fixture.detectChanges();
        expect(component.importMessage()).toBe('');
        expect(fixture.nativeElement.querySelector('ngb-toast.text-bg-info')).toBeNull();
    });

    it('locks historical lists', () => {
        week = '2026-10-12';
        const { component, fixture } = create();
        component.freeText = 'Piles'; component.addFreeItem();
        expect(component.items()).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('lecture seule');
        component.importIngredients(); component.saveShoppingList();
        expect(plans.getByWeekStart).not.toHaveBeenCalled();
    });

    it('prevents overwriting after a failed load', () => {
        api.getRemoteList.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        const { component } = create(); component.freeText = 'Piles'; component.addFreeItem();
        expect(component.items()).toEqual([]);
        expect(component.ready()).toBe(false);
    });

    it('guards query-only week navigation and confirms discarding exactly once', async () => {
        const route = routes.find(entry => entry.path === 'shopping-list')!;
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(), provideRouter([
                    {
                        path: 'shopping-list',
                        component: ShoppingList,
                        canDeactivate: route.canDeactivate,
                        runGuardsAndResolvers: route.runGuardsAndResolvers,
                    }
                ]),
                { provide: WeeklyRecipePlanService, useValue: plans },
                { provide: RecipeService, useValue: recipes }
            ],
        });
        const service = TestBed.inject(ShoppingListService);
        vi.spyOn(service, 'getRemoteList').mockImplementation(api.getRemoteList);
        vi.spyOn(service, 'getPreferences').mockImplementation(api.getPreferences);
        const harness = await RouterTestingHarness.create();
        const component = await harness.navigateByUrl('/shopping-list?week=2026-10-19', ShoppingList);
        component.freeText = 'Piles';
        component.addFreeItem();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        await harness.navigateByUrl('/shopping-list?week=2026-10-26');
        expect(component.weekStart()).toBe('2026-10-19');
        expect(component.items()).toHaveLength(1);
        confirm.mockReturnValue(true);
        await harness.navigateByUrl('/shopping-list?week=2026-10-26');
        expect(component.weekStart()).toBe('2026-10-26');
        expect(component.items()).toEqual([]);
        expect(confirm).toHaveBeenCalledTimes(2);
    });
});

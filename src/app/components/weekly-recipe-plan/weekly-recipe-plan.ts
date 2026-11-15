import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, debounceTime, forkJoin, Observable, of, Subject } from 'rxjs';

import { PlanCandidate, WeeklyRecipePlanService } from './weekly-recipe-plan.service';
import { RecipeStatus, RecipeVegetarianStatus } from '../../enums/recipes.enum';
import { RecipeDto } from '../../models/recipe';
import { WeeklyRecipePlanDto, WeeklyRecipePlanItemDto } from '../../models/weekly-recipe-plan';
import { currentWeek, shiftWeek, validWeek, weekLabel } from '../../utils/week';
import { RecipeService } from '../recipes/recipe.service';

@Component({
    selector: 'weekly-recipe-plan',
    imports: [CommonModule, FormsModule, RouterModule, NgSelectModule, NgbToast],
    templateUrl: './weekly-recipe-plan.html',
    styleUrl: './weekly-recipe-plan.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyRecipePlan {

    private readonly service = inject(WeeklyRecipePlanService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly recipeService = inject(RecipeService);
    private readonly targetChanges = new Subject<void>();
    public readonly weekStart = signal(currentWeek());
    public readonly vegetarianRecipeIds = signal<Set<string>>(new Set());
    public readonly plan = signal<WeeklyRecipePlanDto | null>(null);
    public readonly busy = signal(false);
    public readonly errorMessage = signal('');
    public readonly message = signal('');
    public readonly saveMessage = signal('');
    public readonly replacementFor = signal<string | null>(null);
    public readonly candidates = signal<PlanCandidate[]>([]);
    public readonly notFound = signal(false);
    public readonly targetPending = signal(false);
    public readonly approvedRecipes = signal<RecipeDto[]>([]);
    public readonly loadingAddRecipes = signal(false);
    public readonly addRecipesError = signal('');
    public readonly availableAddRecipes = computed(() => {
        const selected = new Set(this.plan()?.items.map(item => item.recipeId) ?? []);
        return this.approvedRecipes().filter(recipe => recipe.status === RecipeStatus.APPROVED && !selected.has(recipe.id));
    });
    public additionId: string | null = null;
    private addRecipesLoaded = false;
    public replacementId: string | null = null;
    public targetServings = 24;
    public readonly editable = computed(() => this.weekStart() >= currentWeek());
    public readonly current = computed(() => this.weekStart() === currentWeek());
    public readonly cookingEditable = computed(() => {
        const current = currentWeek();
        return this.weekStart() === current || this.weekStart() === shiftWeek(current, -1);
    });
    public readonly canNext = computed(() => this.weekStart() < shiftWeek(currentWeek(), 1));
    public readonly weekLabel = computed(() => weekLabel(this.weekStart()));

    constructor() {
        this.targetChanges.pipe(debounceTime(400), takeUntilDestroyed()).subscribe(() => {
            if (this.targetPending()) this.saveTarget();
        });
        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
            const week = params.get('week') ?? currentWeek();
            this.weekStart.set(validWeek(week) ? week : currentWeek());
            this.loadPlan();
        });
    }

    public changeWeek(offset: number): void {
        this.goWeek(shiftWeek(this.weekStart(), offset));
    }

    public canDeactivate(): boolean {
        if (this.busy() || this.targetPending()) return false;
        return !this.plan() || this.targetServings === this.plan()?.targetServings
            || window.confirm('L’objectif n’a pas été enregistré. Quitter sans sauvegarder cette modification ?');
    }

    @HostListener('window:beforeunload', ['$event'])
    public beforeUnload(event: BeforeUnloadEvent): void {
        if (this.targetPending() || (this.plan() && this.targetServings !== this.plan()?.targetServings)) {
            event.preventDefault();
            event.returnValue = '';
        }
    }
    public goWeek(week = currentWeek()): void {
        if (!this.busy() && !this.targetPending() && validWeek(week)) void this.router.navigate([], { relativeTo: this.route, queryParams: { week } });
    }

    public loadPlan(): void {
        const week = this.weekStart();
        this.busy.set(true);
        this.errorMessage.set('');
        this.message.set('');
        this.saveMessage.set('');
        this.plan.set(null);
        this.vegetarianRecipeIds.set(new Set());
        this.notFound.set(false);
        this.targetPending.set(false);
        this.targetChanges.next();
        this.approvedRecipes.set([]);
        this.additionId = null;
        this.addRecipesLoaded = false;
        this.loadingAddRecipes.set(false);
        this.addRecipesError.set('');
        this.replacementFor.set(null);
        this.targetServings = 24;
        this.service.getByWeekStart(this.weekStart()).subscribe({
            next: plan => {
                if (this.weekStart() !== week) return;
                this.showPlan(plan); this.targetServings = plan.targetServings; this.busy.set(false);
            },
            error: error => {
                if (this.weekStart() !== week) return;
                this.busy.set(false);
                if (error instanceof HttpErrorResponse && error.status === 404) this.notFound.set(true);
                else this.errorMessage.set(this.describeError(error));
            },
        });
    }

    public saveTarget(): void {
        if (!this.plan() && !this.notFound()) return;
        if (Number.isInteger(this.targetServings) && this.targetServings > 0 && this.targetServings !== this.plan()?.targetServings) {
            this.mutate(this.service.setTarget(this.weekStart(), this.targetServings), { targetWrite: true });
        }
    }

    public onTargetChange(value: number): void {
        this.targetServings = value;
        this.targetPending.set(!!this.plan() && this.editable() && Number.isInteger(value) && value > 0 && value !== this.plan()?.targetServings);
        this.targetChanges.next();
    }

    public loadAddRecipes(): void {
        if (this.addRecipesLoaded || this.loadingAddRecipes() || !this.plan() || !this.editable()) return;
        const week = this.weekStart();
        this.loadingAddRecipes.set(true);
        this.addRecipesError.set('');
        this.recipeService.search({ status: [RecipeStatus.APPROVED] }).subscribe({
            next: recipes => {
                if (this.weekStart() !== week) return;
                this.approvedRecipes.set(recipes);
                this.addRecipesLoaded = true;
                this.loadingAddRecipes.set(false);
            },
            error: error => {
                if (this.weekStart() !== week) return;
                this.loadingAddRecipes.set(false);
                this.addRecipesError.set(this.describeError(error));
            },
        });
    }

    public addRecipe(recipeId: string | null): void {
        if (!recipeId || !this.plan() || this.plan()!.items.some(item => item.recipeId === recipeId)) return;
        this.mutate(this.service.add(this.weekStart(), recipeId));
    }

    public complete(): void {
        this.mutate(this.service.complete(this.weekStart()), { completion: true });
    }
    public remove(item: WeeklyRecipePlanItemDto): void {
        this.mutate(this.service.remove(this.weekStart(), item.recipeId));
    }
    public setCooked(item: WeeklyRecipePlanItemDto): void {
        this.mutate(this.service.setCooked(this.weekStart(), item.recipeId, !item.cookedAt), { cookedWrite: true });
    }

    public openReplacement(item: WeeklyRecipePlanItemDto): void {
        if (this.busy() || this.targetPending() || !this.editable()) return;
        const week = this.weekStart();
        this.busy.set(true);
        this.errorMessage.set('');
        this.replacementFor.set(item.recipeId);
        this.replacementId = null;
        this.candidates.set([]);
        this.service.candidates(this.weekStart()).subscribe({
            next: recipes => {
                if (this.weekStart() !== week) return;
                this.candidates.set(recipes); this.busy.set(false);
            },
            error: error => {
                if (this.weekStart() !== week) return;
                this.errorMessage.set(this.describeError(error)); this.busy.set(false);
            },
        });
    }

    public replaceRecipe(): void {
        if (this.replacementFor() && this.replacementId) this.mutate(this.service.replaceRecipe(this.weekStart(), this.replacementFor()!, this.replacementId));
    }

    private mutate(request: Observable<WeeklyRecipePlanDto>, { completion = false, targetWrite = false, cookedWrite = false }: { completion?: boolean; targetWrite?: boolean; cookedWrite?: boolean } = {}): void {
        if (this.busy() || !(cookedWrite ? this.cookingEditable() : this.editable()) || (this.targetPending() && !targetWrite)) return;
        const week = this.weekStart();
        this.busy.set(true);
        this.errorMessage.set('');
        this.message.set('');
        this.saveMessage.set('');
        request.subscribe({
            next: plan => {
                if (this.weekStart() !== week) return;
                this.showPlan(plan);
                this.notFound.set(false);
                this.targetPending.set(false);
                this.additionId = null;
                this.targetServings = plan.targetServings;
                this.replacementFor.set(null);
                this.busy.set(false);
                if (completion && plan.shortage > 0) {
                    this.message.set(`Toutes les recettes admissibles ont été ajoutées. Il manque encore ${plan.shortage} parts.`);
                } else {
                    this.saveMessage.set('Planning enregistré.');
                }
            },
            error: error => {
                if (this.weekStart() !== week) return;
                this.targetPending.set(false);
                this.additionId = null;
                this.errorMessage.set(this.describeError(error)); this.busy.set(false);
            },
        });
    }

    private showPlan(plan: WeeklyRecipePlanDto): void {
        this.plan.set(plan);
        this.vegetarianRecipeIds.set(new Set());
        if (!plan.items.length) return;
        forkJoin(plan.items.map(item => this.recipeService.getDetailRecipe(item.recipeId).pipe(
            catchError(() => of(null)),
        ))).subscribe(recipes => {
            if (this.plan() !== plan) return;
            this.vegetarianRecipeIds.set(new Set(plan.items.filter((_, index) => recipes[index]?.vegetarianStatus === RecipeVegetarianStatus.VEGETARIAN).map(item => item.recipeId)));
        });
    }

    private describeError(error: unknown): string {
        return error instanceof HttpErrorResponse ? error.error?.message ?? 'Impossible de joindre le serveur.' : 'Une erreur est survenue.';
    }

}

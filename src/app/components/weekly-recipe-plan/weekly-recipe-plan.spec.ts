import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WeeklyRecipePlan } from './weekly-recipe-plan';
import { WeeklyRecipePlanService } from './weekly-recipe-plan.service';
import { RecipeVegetarianStatus } from '../../enums/recipes.enum';
import { WeeklyRecipePlanDto } from '../../models/weekly-recipe-plan';
import { RecipeService } from '../recipes/recipe.service';

const plan: WeeklyRecipePlanDto = { weekStart: '2026-10-19',
    targetServings: 24,
    totalServings: 4,
    shortage: 20,
    surplus: 0,
    items: [{ recipeId: 'one', recipeName: 'Soupe', servings: 4, cookedAt: null, source: 'manual' }],
};

describe('WeeklyRecipePlan', () => {
    const api = { getByWeekStart: vi.fn(), setTarget: vi.fn(), complete: vi.fn(), candidates: vi.fn(), replaceRecipe: vi.fn(), remove: vi.fn(), setCooked: vi.fn(), add: vi.fn() };
    const recipes = { search: vi.fn(), getDetailRecipe: vi.fn() };
    let week: string;
    beforeEach(() => {
        vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-19T12:00:00Z')); vi.resetAllMocks();
        week = '2026-10-19';
        recipes.getDetailRecipe.mockReturnValue(of({ vegetarianStatus: RecipeVegetarianStatus.NON_VEGETARIAN }));
        api.getByWeekStart.mockReturnValue(of(plan)); api.setTarget.mockReturnValue(of(plan));
        api.complete.mockReturnValue(of(plan)); api.candidates.mockReturnValue(of([{ _id: 'two', name: 'Plat', servings: 2 }]));
        api.replaceRecipe.mockReturnValue(of(plan));
        recipes.search.mockReturnValue(of([{ id: 'one', name: 'Soupe', servings: 4, status: 'approved' }, { id: 'two', name: 'Dessert', servings: 2, status: 'approved' }]));
        api.add.mockReturnValue(of({ ...plan, items: [...plan.items, { ...plan.items[0], recipeId: 'two' }] }));
    });
    afterEach(() => vi.useRealTimers());
    function create() {
        TestBed.configureTestingModule({ providers: [
            provideRouter([]),
            { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ week })) } },
            { provide: WeeklyRecipePlanService, useValue: api },
            { provide: RecipeService, useValue: recipes },
        ] });
        const fixture = TestBed.createComponent(WeeklyRecipePlan); fixture.detectChanges();
        return { component: fixture.componentInstance, fixture };
    }
    it('dismisses the save confirmation toast after four seconds', () => {
        const { component, fixture } = create();
        component.onTargetChange(30);
        vi.advanceTimersByTime(400);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast')?.textContent).toContain('Planning enregistr\u00e9.');
        vi.advanceTimersByTime(3999); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast')).toBeTruthy();
        vi.advanceTimersByTime(1); fixture.detectChanges();
        expect(component.saveMessage()).toBe('');
        expect(fixture.nativeElement.querySelector('ngb-toast')).toBeNull();
    });

    it('keeps the incomplete planning notice visible after four seconds', () => {
        const { component, fixture } = create();
        component.complete(); fixture.detectChanges();
        vi.advanceTimersByTime(4000); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ngb-toast')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('20 parts');
    });

    it('shows a vegetarian icon beside servings, excluding flexible recipes', () => {
        api.getByWeekStart.mockReturnValue(of({ ...plan, items: ['veg', 'flex', 'meat'].map(recipeId => ({ ...plan.items[0], recipeId })) }));
        recipes.getDetailRecipe.mockImplementation(id => of({ vegetarianStatus: id === 'veg' ? RecipeVegetarianStatus.VEGETARIAN : id === 'flex' ? RecipeVegetarianStatus.FLEXIBLE : RecipeVegetarianStatus.NON_VEGETARIAN }));
        const { component, fixture } = create();
        expect(component.vegetarianRecipeIds()).toEqual(new Set(['veg']));
        const icons = fixture.nativeElement.querySelectorAll('.planned-recipe-servings img');
        expect(icons).toHaveLength(1);
        expect(icons[0].getAttribute('src')).toBe('assets/pictos/vege.png');
        expect(icons[0].previousElementSibling.textContent).toContain('4 parts');
        expect(fixture.nativeElement.textContent).toContain('3 recettes');
        expect(fixture.nativeElement.textContent).not.toContain('(dont');
        api.add.mockReturnValue(of({ ...plan, items: [{ ...plan.items[0], recipeId: 'flex' }] }));
        component.addRecipe('new');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.planned-recipe-servings img')).toBeNull();
    });

    it('defaults to 24 for an absent plan and creates it explicitly', () => {
        api.getByWeekStart.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
        const { component, fixture } = create();
        expect(component.targetServings).toBe(24);
        expect(fixture.nativeElement.textContent).not.toContain('Voir les courses');
        expect(fixture.nativeElement.textContent).not.toContain('Compléter automatiquement');
        expect(fixture.nativeElement.textContent).toContain('Créer le planning');
        component.onTargetChange(30);
        vi.advanceTimersByTime(500);
        expect(api.setTarget).not.toHaveBeenCalled();
        component.saveTarget(); expect(api.setTarget).toHaveBeenCalledWith(week, 30);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Voir les courses');
        expect(fixture.nativeElement.textContent).toContain('Compléter automatiquement');
        expect(fixture.nativeElement.textContent).not.toContain('Enregistrer l’objectif');
    });

    it('autosaves only the last valid target after a typing pause', () => {
        api.setTarget.mockImplementation((_week, target) => of({ ...plan, targetServings: target }));
        const { component } = create();
        component.onTargetChange(3);
        vi.advanceTimersByTime(200);
        component.onTargetChange(32);
        vi.advanceTimersByTime(399);
        expect(api.setTarget).not.toHaveBeenCalled();
        expect(component.canDeactivate()).toBe(false);
        vi.advanceTimersByTime(1);
        expect(api.setTarget).toHaveBeenCalledTimes(1);
        expect(api.setTarget).toHaveBeenCalledWith(week, 32);
        expect(component.plan()?.targetServings).toBe(32);
        expect(component.canDeactivate()).toBe(true);
        component.onTargetChange(0);
        vi.advanceTimersByTime(500);
        component.onTargetChange(1.5);
        vi.advanceTimersByTime(500);
        component.onTargetChange(32);
        vi.advanceTimersByTime(500);
        expect(api.setTarget).toHaveBeenCalledTimes(1);
    });

    it('does not offer creation after a server error and warns before losing a target edit', () => {
        api.getByWeekStart.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        const { component, fixture } = create();
        expect(fixture.nativeElement.textContent).not.toContain('Créer le planning');
        component.saveTarget();
        expect(api.setTarget).not.toHaveBeenCalled();
        api.getByWeekStart.mockReturnValue(of(plan));
        component.loadPlan();
        component.onTargetChange(30);
        const event = new Event('beforeunload', { cancelable: true });
        component.beforeUnload(event as BeforeUnloadEvent);
        expect(event.defaultPrevented).toBe(true);
    });

    it('retries recipe loading and keeps the plan intact after an add error', () => {
        recipes.search.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        const { component } = create();
        component.loadAddRecipes();
        expect(component.addRecipesError()).toBeTruthy();
        recipes.search.mockReturnValue(of([{ id: 'two', name: 'Dessert', servings: 2, status: 'approved' }]));
        component.loadAddRecipes();
        expect(component.addRecipesError()).toBe('');
        expect(component.availableAddRecipes()).toHaveLength(1);
        api.add.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        component.additionId = 'two';
        component.addRecipe('two');
        expect(component.plan()?.items).toEqual(plan.items);
        expect(component.errorMessage()).toBeTruthy();
        expect(component.additionId).toBeNull();
    });

    it('retains the edited target after a failed autosave and supports retry', () => {
        api.setTarget.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        const { component, fixture } = create();
        component.onTargetChange(30);
        vi.advanceTimersByTime(400);
        fixture.detectChanges();
        expect(component.targetServings).toBe(30);
        expect(component.plan()?.targetServings).toBe(24);
        expect(fixture.nativeElement.textContent).toContain('Réessayer la sauvegarde');
        api.setTarget.mockReturnValue(of({ ...plan, targetServings: 30 }));
        component.saveTarget();
        expect(component.plan()?.targetServings).toBe(30);
    });

    it('cancels pending target saves on week reload and on destruction', () => {
        const { component, fixture } = create();
        component.onTargetChange(30);
        component.weekStart.set('2026-10-26');
        component.loadPlan();
        vi.advanceTimersByTime(500);
        expect(api.setTarget).not.toHaveBeenCalled();
        component.onTargetChange(35);
        fixture.destroy();
        vi.advanceTimersByTime(500);
        expect(api.setTarget).not.toHaveBeenCalled();
    });

    it('adds an approved recipe directly and excludes recipes already planned', () => {
        const { component, fixture } = create();
        component.loadAddRecipes();
        expect(recipes.search).toHaveBeenCalledWith({ status: ['approved'] });
        expect(component.availableAddRecipes().map(recipe => recipe.id)).toEqual(['two']);
        component.addRecipe('two');
        fixture.detectChanges();
        expect(api.add).toHaveBeenCalledWith(week, 'two');
        expect(component.plan()?.items).toHaveLength(2);
        expect(component.availableAddRecipes()).toEqual([]);
        expect(component.additionId).toBeNull();
        component.addRecipe('two');
        expect(api.add).toHaveBeenCalledTimes(1);
    });

    it('keeps target input disabled while a write is in flight', async () => {
        const pending = new Subject<WeeklyRecipePlanDto>();
        api.setTarget.mockReturnValue(pending);
        const { component, fixture } = create();
        component.onTargetChange(30);
        vi.advanceTimersByTime(400);
        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();
        expect((fixture.nativeElement.querySelector('#target-servings') as HTMLInputElement).disabled).toBe(true);
        pending.next({ ...plan, targetServings: 30 });
        expect(component.busy()).toBe(false);
    });
    it('reports partial completion and offers searchable replacement candidates', () => {
        const { component, fixture } = create();
        component.complete(); expect(component.message()).toContain('20 parts');
        component.openReplacement(plan.items[0]); fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('ng-select')).toBeTruthy();
        component.replacementId = 'two'; component.replaceRecipe();
        expect(api.replaceRecipe).toHaveBeenCalledWith(week, 'one', 'two');
    });
    it('displays errors from failed immediate saves', () => {
        api.complete.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        const { component } = create(); component.complete();
        expect(component.errorMessage()).toBeTruthy(); expect(component.busy()).toBe(false);
        expect(component.plan()).toEqual(plan);
    });
    it('locks old plans and next-week cooking and bounds future navigation', () => {
        week = '2026-10-12'; const { component, fixture } = create();
        expect(component.editable()).toBe(false);
        expect(fixture.nativeElement.textContent).toContain('lecture seule');
        component.complete(); expect(api.complete).toHaveBeenCalledTimes(1);
        // Observable is constructed, but no request is subscribed for a read-only week.
        component.weekStart.set('2026-10-26'); fixture.detectChanges();
        expect(component.current()).toBe(false); expect(component.canNext()).toBe(false);
        expect(fixture.nativeElement.textContent).not.toContain('Marquer cuisinée');
    });
});

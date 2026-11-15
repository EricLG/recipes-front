import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { WeeklyRecipePlanService } from './weekly-recipe-plan.service';
import { WeeklyRecipePlanDto } from '../../models/weekly-recipe-plan';

describe('WeeklyRecipePlanService', () => {

    let service: WeeklyRecipePlanService;
    let httpTestingController: HttpTestingController;

    const plan: WeeklyRecipePlanDto = {
        weekStart: '2026-10-05',
        targetServings: 12,
        totalServings: 14,
        shortage: 0,
        surplus: 2,
        items: [],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(WeeklyRecipePlanService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTestingController.verify());

    it('récupère le planning pour la semaine demandée', () => {
        service.getByWeekStart('2026-10-05').subscribe();

        const request = httpTestingController.expectOne('/api/weekly-recipe-plans/2026-10-05');
        expect(request.request.method).toBe('GET');
        request.flush(plan);
    });

    it('crée un planning vide ou modifie son objectif', () => {
        service.setTarget('2026-10-05', 12).subscribe();

        const request = httpTestingController.expectOne('/api/weekly-recipe-plans/2026-10-05');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ targetServings: 12 });
        request.flush(plan);
    });

    it('demande un remplacement aléatoire sans recette de destination', () => {
        service.replaceRecipe('2026-10-05', 'recipe-old').subscribe();

        const request = httpTestingController.expectOne('/api/weekly-recipe-plans/2026-10-05/recipes/recipe-old/replace');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({});
        request.flush(plan);
    });

    it('envoie le nouvel état cuisiné de la recette', () => {
        service.setCooked('2026-10-05', 'recipe-1', true).subscribe();

        const request = httpTestingController.expectOne('/api/weekly-recipe-plans/2026-10-05/recipes/recipe-1/cooked');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ cooked: true });
        request.flush(plan);
    });

});

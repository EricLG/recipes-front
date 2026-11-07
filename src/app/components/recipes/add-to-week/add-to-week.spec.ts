import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddToWeek } from './add-to-week';
import { AuthService } from '../../../auth/auth.service';
import { currentWeek } from '../../../utils/week';
import { WeeklyRecipePlanService } from '../../weekly-recipe-plan/weekly-recipe-plan.service';

describe('AddToWeek', () => {
    const auth = { isLoggedIn: vi.fn() };
    const service = { add: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
        auth.isLoggedIn.mockReturnValue(true);
        service.add.mockReturnValue(of({}));
        TestBed.configureTestingModule({ providers: [
            { provide: AuthService, useValue: auth },
            { provide: WeeklyRecipePlanService, useValue: service },
        ] });
    });

    function create() {
        const fixture = TestBed.createComponent(AddToWeek);
        fixture.componentRef.setInput('recipeId', 'recipe-1');
        fixture.componentRef.setInput('compact', true);
        fixture.detectChanges();
        return fixture;
    }

    it('adds to the current week with an accessible compact control', () => {
        const fixture = create();
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.getAttribute('aria-label')).toBe('Ajouter à ma semaine');
        button.click();
        fixture.detectChanges();
        expect(service.add).toHaveBeenCalledWith(currentWeek(), 'recipe-1');
        expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain('ajoutée');
    });

    it('reports duplicate or network errors and remains retryable', () => {
        service.add.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Cette recette est déjà dans le planning' } })));
        const fixture = create();
        fixture.componentInstance.add();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('déjà');
        service.add.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
        fixture.componentInstance.add();
        expect(fixture.componentInstance.busy()).toBe(false);
        expect(fixture.componentInstance.message()).toContain('serveur');
    });

    it('ignores a late response for a previous recipe', () => {
        const request = new Subject<object>();
        service.add.mockReturnValue(request);
        const fixture = create();
        fixture.componentInstance.add();
        fixture.componentRef.setInput('recipeId', 'recipe-2');
        fixture.detectChanges();
        request.next({});
        expect(fixture.componentInstance.message()).toBe('');
    });

    it('hides the action for visitors', () => {
        auth.isLoggedIn.mockReturnValue(false);
        const fixture = create();
        expect(fixture.nativeElement.querySelector('button')).toBeNull();
    });
});

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { WeeklyRecipePlanDto } from '../../models/weekly-recipe-plan';

const API = '/api/weekly-recipe-plans';

@Injectable({ providedIn: 'root' })
export class WeeklyRecipePlanService {

    private readonly http = inject(HttpClient);

    getByWeekStart(week: string) {
        return this.http.get<WeeklyRecipePlanDto>(`${API}/${week}`);
    }
    setTarget(week: string, targetServings: number) {
        return this.http.put<WeeklyRecipePlanDto>(`${API}/${week}`, { targetServings });
    }
    complete(week: string) {
        return this.http.post<WeeklyRecipePlanDto>(`${API}/${week}/complete`, {});
    }
    add(week: string, recipeId: string) {
        return this.http.post<WeeklyRecipePlanDto>(`${API}/${week}/recipes`, { recipeId });
    }
    remove(week: string, recipeId: string) {
        return this.http.delete<WeeklyRecipePlanDto>(`${API}/${week}/recipes/${recipeId}`);
    }
    replaceRecipe(week: string, recipeId: string) {
        return this.http.put<WeeklyRecipePlanDto>(`${API}/${week}/recipes/${recipeId}/replace`, {});
    }
    setCooked(week: string, recipeId: string, cooked: boolean) {
        return this.http.put<WeeklyRecipePlanDto>(`${API}/${week}/recipes/${recipeId}/cooked`, { cooked });
    }

}

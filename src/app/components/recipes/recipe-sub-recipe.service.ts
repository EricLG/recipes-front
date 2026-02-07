import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RecipeSubRecipeDto } from './../../models/recipe';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class RecipeSubRecipeService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<RecipeSubRecipeDto[]> {
        return this.http.get<RecipeSubRecipeDto[]>(`${API_BASE_URL}/recipe-sub-recipes`);
    }

    getById(id: string): Observable<RecipeSubRecipeDto> {
        return this.http.get<RecipeSubRecipeDto>(`${API_BASE_URL}/recipe-sub-recipes/${id}`);
    }

    getByParentRecipeId(parentRecipeId: string): Observable<RecipeSubRecipeDto[]> {
        return this.http.get<RecipeSubRecipeDto[]>(`${API_BASE_URL}/recipe-sub-recipes/parent/${parentRecipeId}`);
    }

    create(recipeSubRecipe: Omit<RecipeSubRecipeDto, 'id'>): Observable<RecipeSubRecipeDto> {
        return this.http.post<RecipeSubRecipeDto>(`${API_BASE_URL}/recipe-sub-recipes`, recipeSubRecipe);
    }

    update(recipeSubRecipe: RecipeSubRecipeDto): Observable<RecipeSubRecipeDto> {
        return this.http.put<RecipeSubRecipeDto>(`${API_BASE_URL}/recipe-sub-recipes/${recipeSubRecipe.id}`, recipeSubRecipe);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/recipe-sub-recipes/${id}`);
    }

}

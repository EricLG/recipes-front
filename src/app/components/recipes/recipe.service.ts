import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RecipeDto, DetailedRecipeDTO } from './../../models/recipe';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class RecipeService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<RecipeDto[]> {
        return this.http.get<RecipeDto[]>(`${API_BASE_URL}/recipes`)
    }

    getById(id: string): Observable<RecipeDto | undefined> {
        return this.http.get<RecipeDto>(`${API_BASE_URL}/recipes/${id}`)
    }

    create(recipe: Omit<RecipeDto, 'id'>): Observable<RecipeDto> {
        return this.http.post<RecipeDto>(`${API_BASE_URL}/recipes`, recipe);
    }

    update(recipe: RecipeDto): Observable<RecipeDto> {
        return this.http.put<RecipeDto>(`${API_BASE_URL}/recipes/${recipe.id}`, recipe);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/recipes/${id}`);
    }

    getDetailRecipe(id: string): Observable<DetailedRecipeDTO> {
        return this.http.get<DetailedRecipeDTO>(`${API_BASE_URL}/recipes/detail/${id}`);
    }
}

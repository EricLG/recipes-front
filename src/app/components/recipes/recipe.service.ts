import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RecipeDto, DetailedRecipeDTO, RecipeWithRelationsDto } from './../../models/recipe';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class RecipeService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<RecipeDto[]> {
        return this.http.get<RecipeDto[]>(`${API_BASE_URL}/recipes`);
    }

    getById(id: string): Observable<RecipeDto | undefined> {
        return this.http.get<RecipeDto>(`${API_BASE_URL}/recipes/${id}`);
    }

    create(recipe: Omit<RecipeDto, 'id'>): Observable<RecipeDto> {
        return this.http.post<RecipeDto>(`${API_BASE_URL}/recipes`, recipe);
    }

    createWithRelations(recipe: Omit<RecipeWithRelationsDto, 'id'>): Observable<RecipeWithRelationsDto> {
        return this.http.post<RecipeWithRelationsDto>(`${API_BASE_URL}/recipes/with-relations`, recipe);
    }

    update(recipe: RecipeDto): Observable<RecipeDto> {
        return this.http.put<RecipeDto>(`${API_BASE_URL}/recipes/${recipe.id}`, recipe);
    }

    updateWithRelations(recipe: RecipeWithRelationsDto): Observable<RecipeWithRelationsDto> {
        return this.http.put<RecipeWithRelationsDto>(`${API_BASE_URL}/recipes/${recipe.id}/with-relations`, recipe);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/recipes/${id}`);
    }

    getDetailRecipe(id: string): Observable<DetailedRecipeDTO> {
        return this.http.get<DetailedRecipeDTO>(`${API_BASE_URL}/recipes/${id}/detail`);
    }

}

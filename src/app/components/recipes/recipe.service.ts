import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RecipeDto, DetailedRecipeDTO, RecipeWithRelationsDto, RecipeFilterDto } from './../../models/recipe';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class RecipeService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<RecipeDto[]> {
        return this.http.get<RecipeDto[]>(`${API_BASE_URL}/recipes`);
    }

    createWithRelations(formData: FormData): Observable<RecipeWithRelationsDto> {
        return this.http.post<RecipeWithRelationsDto>(`${API_BASE_URL}/recipes/with-relations`, formData);
    }

    updateWithRelations(id: string, formData: FormData): Observable<RecipeWithRelationsDto> {
        return this.http.put<RecipeWithRelationsDto>(`${API_BASE_URL}/recipes/${id}/with-relations`, formData);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/recipes/${id}`);
    }

    getDetailRecipe(id: string): Observable<DetailedRecipeDTO> {
        return this.http.get<DetailedRecipeDTO>(`${API_BASE_URL}/recipes/${id}/detail`);
    }

    search(query: RecipeFilterDto): Observable<RecipeDto[]> {
        return this.http.post<RecipeDto[]>(`${API_BASE_URL}/recipes/search`, query);
    }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RecipeFoodDto } from './../../models/recipe';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class RecipeFoodService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<RecipeFoodDto[]> {
        return this.http.get<RecipeFoodDto[]>(`${API_BASE_URL}/recipe-foods`);
    }

    getById(id: string): Observable<RecipeFoodDto> {
        return this.http.get<RecipeFoodDto>(`${API_BASE_URL}/recipe-foods/${id}`);
    }

    getByRecipeId(recipeId: string): Observable<RecipeFoodDto[]> {
        return this.http.get<RecipeFoodDto[]>(`${API_BASE_URL}/recipe-foods/recipe/${recipeId}`);
    }

    create(recipeFood: Omit<RecipeFoodDto, 'id'>): Observable<RecipeFoodDto> {
        return this.http.post<RecipeFoodDto>(`${API_BASE_URL}/recipe-foods`, recipeFood);
    }

    update(recipeFood: RecipeFoodDto): Observable<RecipeFoodDto> {
        return this.http.put<RecipeFoodDto>(`${API_BASE_URL}/recipe-foods/${recipeFood.id}`, recipeFood);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/recipe-foods/${id}`);
    }
}

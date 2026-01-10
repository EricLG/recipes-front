import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ingredient } from '../../models/ingredient';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class IngredientService {
    constructor(private http: HttpClient) {}

    getAll(): Observable<ingredient[]> {
        return this.http.get<ingredient[]>(`${API_BASE_URL}/ingredients`);
    }

    getById(id: string): Observable<ingredient | undefined> {
        return this.http.get<ingredient>(`${API_BASE_URL}/ingredients/${id}`);
    }

    create(ing: Omit<ingredient, 'id'>): Observable<ingredient> {
        return this.http.post<ingredient>(`${API_BASE_URL}/ingredients`, ing);
    }

    update(ing: ingredient): Observable<ingredient> {
        return this.http.put<ingredient>(`${API_BASE_URL}/ingredients/${ing.id}`, ing);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/ingredients/${id}`);
    }
}

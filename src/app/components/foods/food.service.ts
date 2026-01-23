import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FoodDto } from './../../models/food';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class FoodService {
    constructor(private http: HttpClient) {}

    getAll(): Observable<FoodDto[]> {
        return this.http.get<FoodDto[]>(`${API_BASE_URL}/foods`);
    }

    getById(id: string): Observable<FoodDto | undefined> {
        return this.http.get<FoodDto>(`${API_BASE_URL}/foods/${id}`);
    }

    create(food: Omit<FoodDto, 'id'>): Observable<FoodDto> {
        return this.http.post<FoodDto>(`${API_BASE_URL}/foods`, food);
    }

    update(food: FoodDto): Observable<FoodDto> {
        return this.http.put<FoodDto>(`${API_BASE_URL}/foods/${food.id}`, food);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/foods/${id}`);
    }
}

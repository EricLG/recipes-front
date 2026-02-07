import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FoodDto, MeasureDto, FoodWithMeasuresDto } from './../../models/food';

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

    getByIdWithMeasures(id: string): Observable<FoodWithMeasuresDto> {
        return this.http.get<FoodWithMeasuresDto>(`${API_BASE_URL}/foods/${id}/with-measures`);
    }

    create(food: Omit<FoodDto, 'id'>): Observable<FoodDto> {
        return this.http.post<FoodDto>(`${API_BASE_URL}/foods`, food);
    }

    createWithMeasures(food: Omit<FoodDto, 'id'>, measures: Omit<MeasureDto, 'id'>[]): Observable<FoodWithMeasuresDto> {
        return this.http.post<FoodWithMeasuresDto>(`${API_BASE_URL}/foods/with-measures`, { ...food, measures });
    }

    update(food: FoodDto): Observable<FoodDto> {
        return this.http.put<FoodDto>(`${API_BASE_URL}/foods/${food.id}`, food);
    }

    updateWithMeasures(food: FoodDto, measures: MeasureDto[]): Observable<FoodWithMeasuresDto> {
        return this.http.put<FoodWithMeasuresDto>(`${API_BASE_URL}/foods/${food.id}/with-measures`, { ...food, measures });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/foods/${id}`);
    }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MeasureDto } from './../../models/food';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class MeasureService {

    constructor(private http: HttpClient) {}

    getAll(): Observable<MeasureDto[]> {
        return this.http.get<MeasureDto[]>(`${API_BASE_URL}/measures`);
    }

    getById(id: string): Observable<MeasureDto | undefined> {
        return this.http.get<MeasureDto>(`${API_BASE_URL}/measures/${id}`);
    }

    create(measure: Omit<MeasureDto, 'id'>): Observable<MeasureDto> {
        return this.http.post<MeasureDto>(`${API_BASE_URL}/measures`, measure);
    }

    update(measure: MeasureDto): Observable<MeasureDto> {
        return this.http.put<MeasureDto>(`${API_BASE_URL}/measures/${measure.id}`, measure);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/measures/${id}`);
    }

    getAllMeasuresByFoodId(foodId: string): Observable<MeasureDto[]> {
        return this.http.get<MeasureDto[]>(`${API_BASE_URL}/measures/foods/${foodId}`);
    }
}

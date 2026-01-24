import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// const API_BASE_URL = '/api'; // TODO: adjust endpoint when backend ready

@Injectable({ providedIn: 'root' })
export class RecipeFoodService {

    constructor(private http: HttpClient) {}

    // TODO: adjust endpoint when backend ready
}

// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, map } from 'rxjs';
// import { Recipe } from '../../models/recipe';

// const API_BASE_URL = '/api';

// @Injectable({ providedIn: 'root' })
// export class RecipeFoodService {

//     constructor(private http: HttpClient) {}

//     getAll(): Observable<Recipe[]> {
//         return this.http.get<Recipe[]>(`${API_BASE_URL}/recipes-foods`).pipe(
//             map(recipes => recipes.map(r => new Recipe(
//                 r.id,
//                 r.name,
//                 r.ingredients,
//                 r.instructions,
//                 r.season,
//                 r.vegetarian,
//                 r.nbParts,
//                 r.category,
//                 r.subCourses
//             )))
//         );
//     }

//     getById(id: string): Observable<Recipe | undefined> {
//         return this.http.get<Recipe>(`${API_BASE_URL}/recipes-foods/${id}`).pipe(
//             map(recipe => recipe ? new Recipe(
//                 recipe.id,
//                 recipe.name,
//                 recipe.ingredients,
//                 recipe.instructions,
//                 recipe.season,
//                 recipe.vegetarian,
//                 recipe.nbParts,
//                 recipe.category,
//                 recipe.subCourses
//             ) : undefined)
//         );
//     }

//     create(recipe: Omit<Recipe, 'id'>): Observable<Recipe> {
//         return this.http.post<Recipe>(`${API_BASE_URL}/recipes-foods`, recipe);
//     }

//     update(recipe: Recipe): Observable<Recipe> {
//         return this.http.put<Recipe>(`${API_BASE_URL}/recipes-foods/${recipe.id}`, recipe);
//     }

//     delete(id: string): Observable<void> {
//         return this.http.delete<void>(`${API_BASE_URL}/recipes-foods/${id}`);
//     }

// }

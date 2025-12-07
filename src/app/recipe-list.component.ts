import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Recipe } from '../models/recipe';
import { RecipeService } from './recipe.service';

@Component({
    selector: 'recipe-list',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mt-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Recettes</h2>
            <a class="btn btn-primary" routerLink="/add">Ajouter une recette</a>
        </div>

            @if (!recipes.length) {
                <div class="alert alert-info">Aucune recette. Cliquez sur « Ajouter une recette » ou chargez les exemples.</div>
            }

            <div class="list-group">
                @for (r of recipes; track $index) {
                    <a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" [routerLink]="['/recipe', r.id]">
                        <div>
                            <div class="fw-bold">{{ r.name }}</div>
                            <small class="text-muted">{{ r.nbParts }} parts · {{ r.kiloCalories }} kcal</small>
                        </div>
                        <span class="badge bg-secondary">Détails</span>
                    </a>
                }
        </div>

        <div class="mt-3">
        <button class="btn btn-outline-secondary me-2" (click)="seed()">Charger exemples depuis CSV</button>
        <button class="btn btn-outline-danger" (click)="clearAll()">Supprimer tout</button>
        </div>
    </div>
    `,
    styles: [],
})
export class RecipeListComponent {
    recipes: Recipe[] = [];

    constructor(private svc: RecipeService) {
        this.refresh();
    }

    refresh() {
        this.recipes = this.svc.getAll();
    }

    async seed() {
        await this.svc.seedFromCsvAsset();
        this.refresh();
    }

    clearAll() {
        localStorage.removeItem('recipes_data_v1');
        this.refresh();
    }
}

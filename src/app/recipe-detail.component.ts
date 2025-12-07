import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from './recipe.service';
import { Recipe } from '../models/recipe';

@Component({
    selector: 'recipe-detail',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mt-3" *ngIf="recipe; else notFound">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>{{ recipe.name }}</h2>
        <div>
          <a class="btn btn-secondary me-2" routerLink="/">Retour</a>
          <button class="btn btn-danger" (click)="remove()">Supprimer</button>
        </div>
      </div>

      <div class="mb-2"><strong>Parts:</strong> {{ recipe.nbParts }}</div>
      <div class="mb-2"><strong>Kcal:</strong> {{ recipe.kiloCalories }}</div>
      <div class="mb-2"><strong>Saison:</strong> {{ recipe.season }}</div>
      <div class="mb-2"><strong>Végétarien:</strong> {{ recipe.vegetarian ? 'Oui' : 'Non' }}</div>

      <h5>Ingrédients</h5>
      <ul class="list-group mb-3">
        <li class="list-group-item" *ngFor="let ing of recipe.ingredients">
          {{ ing.name }} — {{ ing.quantity }} ({{ ing.kiloCalories }} kcal)
        </li>
      </ul>

      <h5>Instructions</h5>
      <p class="pre-line">{{ recipe.instructions || '—' }}</p>
    </div>

    <ng-template #notFound>
      <div class="container mt-3">
        <div class="alert alert-warning">Recette introuvable.</div>
        <a class="btn btn-secondary" routerLink="/">Retour à la liste</a>
      </div>
    </ng-template>
  `,
})
export class RecipeDetailComponent {
    recipe: Recipe | undefined;
    id = 0;

    constructor(private route: ActivatedRoute, private svc: RecipeService, private router: Router) {
        const param = this.route.snapshot.paramMap.get('id');
        this.id = param ? Number(param) : 0;
        this.recipe = this.svc.getById(this.id);
    }

    remove() {
        if (!this.recipe) return;
        if (confirm('Supprimer cette recette ?')) {
            this.svc.delete(this.recipe.id);
            this.router.navigate(['/']);
        }
    }
}

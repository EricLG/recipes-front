import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ingredient } from '../models/ingredient';
import { RecipeService } from './recipe.service';

@Component({
    selector: 'recipe-form',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="container mt-3">
      <h2>Ajouter une recette</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Nom</label>
          <input class="form-control" formControlName="name" />
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Parts</label>
            <input type="number" class="form-control" formControlName="nbParts" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Kcal</label>
            <input type="number" class="form-control" formControlName="kiloCalories" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Saison</label>
            <input class="form-control" formControlName="season" />
          </div>
        </div>

        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" formControlName="vegetarian" id="veg" />
          <label class="form-check-label" for="veg">Végétarien</label>
        </div>

        <div class="mb-3">
          <label class="form-label">Instructions</label>
          <textarea class="form-control" rows="4" formControlName="instructions"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Ingrédients (une par ligne, format: nom|quantité|kcal)</label>
          <textarea class="form-control" rows="4" formControlName="ingredientsText"></textarea>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Créer</button>
          <a class="btn btn-secondary" routerLink="/">Annuler</a>
        </div>
      </form>
    </div>
  `,
})
export class RecipeFormComponent {
    public form: FormGroup

    constructor(private fb: FormBuilder, private svc: RecipeService, private router: Router) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            nbParts: [1, [Validators.required, Validators.min(1)]],
            kiloCalories: [0, [Validators.min(0)]],
            season: [''],
            vegetarian: [false],
            instructions: [''],
            ingredientsText: [''],
        });
    }

    parseIngredients(text: string): ingredient[] {
        return text
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean)
            .map((line, i) => {
                const parts = line.split('|').map(p => p.trim());
                return {
                    id: i + 1,
                    name: parts[0] ?? 'Ingredient',
                    quantity: parts[1] ?? '',
                    kiloCalories: Number(parts[2] ?? 0),
                    proteins: 0,
                    carbohydrates: 0,
                    fats: 0,
                    fibers: 0,
                } as ingredient;
            });
    }

    submit() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const ingredients = this.parseIngredients(v.ingredientsText || '');
        this.svc.create({
            name: v.name,
            nbParts: Number(v.nbParts) || 1,
            totalKiloCalories: Number(v.kiloCalories) || 0,
            season: v.season || '',
            vegetarian: !!v.vegetarian,
            instructions: v.instructions || '',
            ingredients,
        });
        this.router.navigate(['/']);
    }
}

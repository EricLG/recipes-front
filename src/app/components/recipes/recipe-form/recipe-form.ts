import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ingredient } from '../../../../models/ingredient';
import { IngredientService } from '../../../services/ingredient.service';
import { RecipeService } from '../recipe.service';

interface QtyIngredientForm {
    ingredientId: string;
    quantity: number;
    unit: string;
}

@Component({
    selector: 'recipe-form',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './recipe-form.html',
    styleUrls: ['./recipe-form.scss'],
})
export class RecipeForm implements OnInit {
    public form: FormGroup;
    public availableIngredients: ingredient[] = [];

    constructor(
        private fb: FormBuilder,
        private svc: RecipeService,
        private ingSvc: IngredientService,
        private router: Router
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            nbParts: [1, [Validators.required, Validators.min(1)]],
            season: [''],
            vegetarian: [false],
            instructions: ['', Validators.required],
            category: ['', Validators.required],
            ingredients: this.fb.array([])
        });
    }

    ngOnInit() {
        this.ingSvc.getAll().subscribe({
            next: (ings) => this.availableIngredients = ings,
            error: (err) => console.error('Erreur chargement ingrédients:', err)
        });
    }

    get ingredientsArray(): FormArray {
        return this.form.get('ingredients') as FormArray;
    }

    addIngredient() {
        this.ingredientsArray.push(this.fb.group({
            ingredientId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(0)]],
            unit: ['']
        }));
    }

    removeIngredient(index: number) {
        this.ingredientsArray.removeAt(index);
    }

    submit() {
        if (this.form.invalid) return;
        const v = this.form.value;

        const ingredients = v.ingredients.map((ing: QtyIngredientForm) => ({
            ingredient: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit || undefined
        }));

        console.log('Creating recipe with data:', {...v, ingredients});

        // this.svc.create({
        //     name: v.name,
        //     nbParts: v.nbParts,
        //     season: v.season || undefined,
        //     vegetarian: v.vegetarian,
        //     instructions: v.instructions,
        //     category: v.category,
        //     ingredients
        // }).subscribe({
        //     next: () => this.router.navigate(['/']),
        //     error: (err) => console.error('Erreur création recette:', err)
        // });
    }
}

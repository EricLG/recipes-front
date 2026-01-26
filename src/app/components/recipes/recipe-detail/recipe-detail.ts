import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { NutrientsDto } from './../../../models/food';
import { DetailedRecipeDTO } from './../../../models/recipe';
import { RecipeService } from './../recipe.service';

@Component({
    selector: 'recipe-detail',
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-detail.html',
    styleUrls: ['./recipe-detail.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeDetail {
    private route = inject(ActivatedRoute);
    private svc = inject(RecipeService);
    private router = inject(Router);

    // Get recipe ID from route parameters
    private readonly id$ = this.route.paramMap.pipe(
        map(p => p.get('id')),
        filter((id): id is string => id !== null)
    );
    public readonly id = toSignal(this.id$, { initialValue: null });

    // Fetch detailed recipe data
    private readonly recipe$ = this.id$.pipe(
        switchMap(id => id ? this.svc.getDetailRecipe(id) : of(null))
    );
    public readonly recipe = toSignal<DetailedRecipeDTO | null>(this.recipe$, { initialValue: null });

    // Compute total nutrients
    public readonly totalNutrients = computed(() => {
        const recipe = this.recipe();
        if (!recipe || !recipe.recipeFoods) return null;

        const totals: NutrientsDto = {
            energyKcal: 0,
            proteins: 0,
            fats: 0,
            carbohydrates: 0,
            sugars: 0,
            fibers: 0,
            salt: 0
        };

        recipe.recipeFoods.forEach(recipeFood => {
            const quantity = recipeFood.quantity;
            const grams = recipeFood.measure.grams;
            const nutrients = recipeFood.measure.foodId.nutrientsPer100;

            const factor = (quantity * grams) / 100;

            totals.energyKcal += nutrients.energyKcal * factor;
            totals.proteins += nutrients.proteins * factor;
            totals.fats += nutrients.fats * factor;
            totals.carbohydrates += nutrients.carbohydrates * factor;
            totals.sugars += nutrients.sugars * factor;
            totals.fibers += nutrients.fibers * factor;
            totals.salt += nutrients.salt * factor;
        });

        // Divide by servings to get nutrients per serving
        const servings = recipe.servings;
        totals.energyKcal /= servings;
        totals.proteins /= servings;
        totals.fats /= servings;
        totals.carbohydrates /= servings;
        totals.sugars /= servings;
        totals.fibers /= servings;
        totals.salt /= servings;

        return totals;
    });

    remove() {
        const recipe = this.recipe();
        if (!recipe) return;
        if (confirm('Supprimer cette recette ?')) {
            this.svc.delete(recipe.id).subscribe({
                next: () => this.router.navigate(['/recipes']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }
}

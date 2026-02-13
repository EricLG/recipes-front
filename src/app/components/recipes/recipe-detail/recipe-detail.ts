import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { RecipeCategory, RecipeSeason, seasonTranslations, recipeCategoryTranslations } from './../../../enums/recipes.enum';
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

        // Compute totals for a recipe (including nested sub-recipes)
        const computeTotalsForRecipe = (r: DetailedRecipeDTO, stack = new Set<string>()): NutrientsDto => {
            if (!r) return {
                energyKcal: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
                sugars: 0,
                fibers: 0,
                salt: 0
            };

            if (stack.has(r.id)) {
                return {
                    energyKcal: 0,
                    proteins: 0,
                    fats: 0,
                    carbohydrates: 0,
                    sugars: 0,
                    fibers: 0,
                    salt: 0
                };
            }

            stack.add(r.id);

            const local: NutrientsDto = {
                energyKcal: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
                sugars: 0,
                fibers: 0,
                salt: 0
            };

            r.recipeFoods?.forEach(recipeFood => {
                const factor = (recipeFood.quantity * recipeFood.measure.grams) / 100;
                const n = recipeFood.food.nutrientsPer100;

                local.energyKcal += n.energyKcal * factor;
                local.proteins += n.proteins * factor;
                local.fats += n.fats * factor;
                local.carbohydrates += n.carbohydrates * factor;
                local.sugars += n.sugars * factor;
                local.fibers += n.fibers * factor;
                local.salt += n.salt * factor;
            });

            r.recipeSubRecipes?.forEach(sub => {
                const child = sub.childRecipe;
                if (!child) return;
                if (stack.has(child.id)) return;

                const childTotals = computeTotalsForRecipe(child, stack);
                const scale = child.servings ? (sub.quantity / child.servings) : sub.quantity;

                local.energyKcal += childTotals.energyKcal * scale;
                local.proteins += childTotals.proteins * scale;
                local.fats += childTotals.fats * scale;
                local.carbohydrates += childTotals.carbohydrates * scale;
                local.sugars += childTotals.sugars * scale;
                local.fibers += childTotals.fibers * scale;
                local.salt += childTotals.salt * scale;
            });

            stack.delete(r.id);
            return local;
        };

        const recipeTotals = computeTotalsForRecipe(recipe);

        totals.energyKcal = recipeTotals.energyKcal;
        totals.proteins = recipeTotals.proteins;
        totals.fats = recipeTotals.fats;
        totals.carbohydrates = recipeTotals.carbohydrates;
        totals.sugars = recipeTotals.sugars;
        totals.fibers = recipeTotals.fibers;
        totals.salt = recipeTotals.salt;

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

    public edit(): void {
        const recipe = this.recipe();

        console.log('Editing recipe:', recipe);
        if (!recipe) return;
        this.router.navigate(['/recipes/edit', recipe.id]);
    }

    public remove(): void {
        const recipe = this.recipe();
        if (!recipe) return;
        if (confirm('Supprimer cette recette ?')) {
            this.svc.delete(recipe.id).subscribe({
                next: () => this.router.navigate(['/recipes']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }

    public getSeasonLabel(season: string): string {
        return seasonTranslations[season as RecipeSeason] || season;
    }

    public getCategoryLabel(category: string): string {
        return recipeCategoryTranslations[category as RecipeCategory] || category;
    }

}

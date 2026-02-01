import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { RecipeCategory, RecipeSeason } from '../../../enums/recipes.enum';
import { MeasureDto } from '../../../models/food';
import { RecipeDto, RecipeWithRelationsDto } from '../../../models/recipe';
import { FoodService } from '../../foods/food.service';
import { MeasureService } from '../../foods/measure.service';
import { RecipeService } from '../recipe.service';

@Component({
    selector: 'recipe-form',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
    ],
    templateUrl: './recipe-form.html',
    styleUrl: './recipe-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeForm {

    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private svcRecipe = inject(RecipeService);
    private svcFood = inject(FoodService);
    private svcMeasure = inject(MeasureService);

    // Get recipe ID from route parameters
    private readonly id$ = this.route.paramMap.pipe(
        map(p => p.get('id')),
        filter((id): id is string => id !== null)
    );
    public readonly id = toSignal(this.id$, { initialValue: null });

    // Fetch recipe data if editing
    private readonly recipe$ = this.id$.pipe(
        switchMap(id => id ? this.svcRecipe.getDetailRecipe(id) : of(null))
    );
    public readonly recipe = toSignal(this.recipe$, { initialValue: null });

    // Fetch available foods
    public readonly foods = toSignal(this.svcFood.getAll(), { initialValue: [] });

    // Fetch all recipes
    private readonly allRecipes = toSignal(this.svcRecipe.getAll(), { initialValue: [] });

    // Fetch available recipes (excluding current one)
    public readonly recipes = computed(() => {
        const currentId = this.id();
        return this.allRecipes().filter(r => r.id !== currentId);
    });

    // Fetch available measures
    public readonly measures = toSignal(this.svcMeasure.getAll(), { initialValue: [] });

    // Dynamic title
    public readonly title = computed(() => this.id() ? 'Modifier une recette' : 'Ajouter une recette');

    // Enums
    public readonly seasons = Object.values(RecipeSeason);
    public readonly categories = Object.values(RecipeCategory);

    // Track forms visibility
    public readonly showNewRecipeFoodForm = signal(false);
    public readonly showNewSubRecipeForm = signal(false);

    public readonly recipeForm = this.fb.group({
        name: ['', Validators.required],
        instructions: [''],
        vegetarian: [false],
        season: [RecipeSeason.ALL_YEAR],
        category: [RecipeCategory.MAIN],
        servings: [1, [Validators.required, Validators.min(1)]],
        recipeFoods: this.fb.array([]),
        recipeSubRecipes: this.fb.array([]),
    });

    public readonly recipeFoodsArray = this.recipeForm.get('recipeFoods') as FormArray;
    public readonly recipeSubRecipesArray = this.recipeForm.get('recipeSubRecipes') as FormArray;

    // Populate form when recipe data is available
    constructor() {
        effect(() => {
            const recipe = this.recipe();
            if (recipe) {
                const { recipeFoods, recipeSubRecipes, ...recipeData } = recipe;
                this.recipeForm.patchValue(recipeData);

                // Clear existing arrays
                this.recipeFoodsArray.clear();
                this.recipeSubRecipesArray.clear();

                // Add existing recipeFoods (include id for updates per Option C strict mode)
                if (recipeFoods && recipeFoods.length > 0) {
                    recipeFoods.forEach(rf => {
                        console.log('Adding recipe food to form array:', rf); // Debug log
                        this.recipeFoodsArray.push(this.fb.group({
                            id: [rf.id],  // Include ID for update operations
                            foodId: [rf.food.id, Validators.required],
                            measureId: [rf.measure.id, Validators.required],
                            quantity: [rf.quantity, [Validators.required, Validators.min(0.1)]],
                        }));
                    });
                }

                // Add existing recipeSubRecipes (include id for updates per Option C strict mode)
                if (recipeSubRecipes && recipeSubRecipes.length > 0) {
                    recipeSubRecipes.forEach(sr => {
                        this.recipeSubRecipesArray.push(this.fb.group({
                            id: [sr.id],  // Include ID for update operations
                            childRecipeId: [sr.childRecipeId, Validators.required],
                            quantity: [sr.quantity, [Validators.required, Validators.min(0.1)]],
                        }));
                    });
                }
            }
        });
    }

    private createRecipeFoodFormGroup(): FormGroup {
        return this.fb.group({
            id: [null],  // New items have no id; will be auto-assigned by backend
            foodId: ['', Validators.required],
            measureId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(0.1)]],
        });
    }

    private createSubRecipeFormGroup(): FormGroup {
        return this.fb.group({
            id: [null],  // New items have no id; will be auto-assigned by backend
            childRecipeId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(0.1)]],
        });
    }

    public addNewRecipeFood(): void {
        this.recipeFoodsArray.push(this.createRecipeFoodFormGroup());
        this.showNewRecipeFoodForm.set(true);
    }

    public removeRecipeFood(index: number): void {
        this.recipeFoodsArray.removeAt(index);
    }

    public addNewSubRecipe(): void {
        this.recipeSubRecipesArray.push(this.createSubRecipeFormGroup());
        this.showNewSubRecipeForm.set(true);
    }

    public removeSubRecipe(index: number): void {
        this.recipeSubRecipesArray.removeAt(index);
    }

    public getMeasuresForFood(foodId: string): MeasureDto[] {
        return this.measures().filter(m => m.foodId === foodId);
    }

    public onSubmit(): void {
        if (this.recipeForm.invalid) return;

        const data = this.recipeForm.value;
        const recipeData = {
            name: data.name,
            instructions: data.instructions,
            vegetarian: data.vegetarian,
            season: data.season,
            category: data.category,
            servings: data.servings,
        } as Omit<RecipeDto, 'id'>;

        // Normalize recipeFoods: remove `id` property when null/undefined (REST best practice)
        const recipeFoods = (data.recipeFoods || []).map((rf: any) => {
            const copy: any = {
                foodId: rf.foodId,
                measureId: rf.measureId,
                quantity: rf.quantity,
            };
            if (rf.id !== null && rf.id !== undefined && rf.id !== '') {
                copy.id = rf.id;
            }
            return copy;
        });

        // Normalize recipeSubRecipes: remove `id` property when null/undefined (REST best practice)
        const recipeSubRecipes = (data.recipeSubRecipes || []).map((sr: any) => {
            const copy: any = {
                childRecipeId: sr.childRecipeId,
                quantity: sr.quantity,
            };
            if (sr.id !== null && sr.id !== undefined && sr.id !== '') {
                copy.id = sr.id;
            }
            return copy;
        });

        const createOrUpdate$ = this.id()
            ? this.svcRecipe.updateWithRelations({
                ...recipeData,
                id: this.id()!,
                recipeFoods,
                recipeSubRecipes
            } as RecipeWithRelationsDto)
            : this.svcRecipe.createWithRelations({
                ...recipeData,
                recipeFoods,
                recipeSubRecipes,
            } as Omit<RecipeWithRelationsDto, 'id'>);

        createOrUpdate$.subscribe({
            next: (recipe) => this.router.navigate(['/recipes', recipe.id]),
            error: (err) => console.error('Erreur sauvegarde:', err)
        });
    }
}

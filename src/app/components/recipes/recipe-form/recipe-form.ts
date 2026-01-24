import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { RecipeCategory, RecipeSeason } from '../../../enums/recipes.enum';
import { RecipeDto } from '../../../models/recipe';
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

    // Get recipe ID from route parameters - using toSignal to convert observable to signal
    private readonly id$ = this.route.paramMap.pipe(
        map(p => p.get('id')),
        filter((id): id is string => id !== null)
    );
    public readonly id = toSignal(this.id$, { initialValue: null });

    // Fetch recipe data if editing an existing recipe
    private readonly recipe$ = this.id$.pipe(
        switchMap(id => id ? this.svcRecipe.getById(id) : of(null))
    );
    public readonly recipe = toSignal(this.recipe$, { initialValue: null });

    // Dynamic title based on whether adding or editing
    public readonly title = computed(() => this.id() ? 'Modifier une recette' : 'Ajouter une recette');

    // Enums for dropdowns
    public readonly seasons = Object.values(RecipeSeason);
    public readonly categories = Object.values(RecipeCategory);

    public readonly recipeForm = this.fb.group({
        name: ['', Validators.required],
        instructions: [''],
        vegetarian: [false],
        season: [RecipeSeason.ALL_YEAR],
        category: [RecipeCategory.OTHERS, Validators.required],
        servings: [1, [Validators.required, Validators.min(1)]],
    });

    // Populate form when recipe data is available
    constructor() {
        effect(() => {
            const recipe = this.recipe();
            if (recipe) {
                this.recipeForm.patchValue(recipe);
            }
        });
    }

    onSubmit(): void {
        if (this.recipeForm.invalid) return;

        const data = this.recipeForm.value;
        const createOrUpdate$ = this.id() ? this.svcRecipe.update({ ...data, id: this.id()! } as RecipeDto) : this.svcRecipe.create(data as Omit<RecipeDto, 'id'>)

        createOrUpdate$.subscribe({
            next: (recipe) => this.router.navigate(['/recipes', recipe.id]),
            error: (err) => console.error('Erreur sauvegarde:', err)
        });
    }
}

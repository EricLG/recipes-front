import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { RecipeCategory, RecipeSeason, RecipeVegetarianStatus, recipeCategoryTranslations, seasonTranslations, recipeVegetarianStatusTranslations } from "../../enums/recipes.enum";
import { RecipeFilterDto } from "../../models/recipe";
import { RecipeFilterService } from "../recipes/recipe-filter.service";

@Component({
    selector: 'app-search-filters',
    templateUrl: './search-filters.html',
    styleUrls: ['./search-filters.scss'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class SearchFilters {

    protected categories = Object.entries(recipeCategoryTranslations);
    protected seasons = Object.entries(seasonTranslations);
    protected vegetarianStatusOptions = Object.entries(recipeVegetarianStatusTranslations);

    protected filterForm: FormGroup;

    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly filterService = inject(RecipeFilterService);

    constructor() {
        this.filterForm = this.fb.group({
            name: [''],
            category: [''],
            season: [''],
            vegetarian: ['']
        });
    }

    protected onSearch(): void {
        const filter = this.buildFilter();
        this.filterService.setFilter(filter);
        this.router.navigate(['/recipes']);
    }

    private buildFilter(): RecipeFilterDto {
        const filter: RecipeFilterDto = {};
        const formValue = this.filterForm.getRawValue();

        const cleanedName = formValue.name?.trim().slice(0, 40);
        if (cleanedName) {
            filter.name = cleanedName;
        }

        if (formValue.category) {
            filter.category = formValue.category as RecipeCategory;
        }

        if (formValue.season) {
            filter.seasons = [formValue.season as RecipeSeason];
        }

        if (formValue.vegetarianStatus) {
            filter.vegetarianStatus = formValue.vegetarianStatus as RecipeVegetarianStatus;
        }

        return filter;
    }

}

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { debounceTime, Subscription } from "rxjs";

import { RecipeCategory, RecipeSeason, RecipeVegetarianStatus, recipeCategoryTranslations, seasonTranslations, recipeVegetarianStatusTranslations } from "../../enums/recipes.enum";
import { RecipeFilterDto } from "../../models/recipe";
import { RecipeFilterService } from "../recipes/recipe-filter.service";

@Component({
    selector: 'app-search-filters',
    templateUrl: './search-filters.html',
    styleUrls: ['./search-filters.scss'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class SearchFilters implements OnDestroy {

    protected categories = Object.entries(recipeCategoryTranslations);
    protected seasons = Object.entries(seasonTranslations);
    protected vegetarianStatusOptions = Object.entries(recipeVegetarianStatusTranslations);

    protected filterForm: FormGroup;

    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly filterService = inject(RecipeFilterService);
    private readonly filterFormValueChanges$: Subscription
    private readonly filterSvc$: Subscription

    constructor() {
        this.filterForm = this.fb.group({
            name: [''],
            category: [''],
            season: [''],
            vegetarianStatus: ['']
        });
        this.filterFormValueChanges$ =this.filterForm.valueChanges.pipe(
            debounceTime(500)
        ).subscribe(() => this.onSearch());

        this.filterSvc$ = this.filterService.filter$.subscribe(filter => {
            this.filterForm.patchValue({
                name: filter.name || '',
                category: filter.category || '',
                season: filter.seasons ? filter.seasons[0] : '',
                vegetarianStatus: filter.vegetarianStatus || ''
            }, { emitEvent: false });
        });
    }

    ngOnDestroy(): void {
        this.filterFormValueChanges$.unsubscribe();
        this.filterSvc$.unsubscribe();
    }

    protected resetFilters(): void {
        this.filterForm.reset({
            name: '',
            category: '',
            season: '',
            vegetarianStatus: ''
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

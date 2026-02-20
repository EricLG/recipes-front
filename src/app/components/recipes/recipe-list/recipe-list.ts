import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RecipeFilterService } from '../recipe-filter.service';
import { RecipeSeason, RecipeCategory, seasonTranslations, recipeCategoryTranslations } from './../../../enums/recipes.enum';
import { RecipeDto } from './../../../models/recipe';
import { RecipeService } from './../recipe.service';

@Component({
    selector: 'recipe-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-list.html',
    styleUrls: ['./recipe-list.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeList {

    public recipes$!: Observable<RecipeDto[]>;

    private readonly allSeasons: RecipeSeason[] = [
        RecipeSeason.SPRING,
        RecipeSeason.SUMMER,
        RecipeSeason.AUTUMN,
        RecipeSeason.WINTER,
    ];

    private readonly recipeService = inject(RecipeService);
    private readonly filterService = inject(RecipeFilterService);

    constructor() {
        this.recipes$ = this.filterService.filter$.pipe(
            switchMap((filter) => this.recipeService.search(filter))
        );
    }


    public getSeasonsToDisplay(seasons: RecipeSeason[]): RecipeSeason[] {
        return seasons.includes(RecipeSeason.ALL_YEAR) ? this.allSeasons : seasons;
    }

    public getSeasonLabel(season: string): string {
        return seasonTranslations[season as RecipeSeason] || season;
    }

    public getCategoryLabel(category: string): string {
        return recipeCategoryTranslations[category as RecipeCategory] || category;
    }

    public servingMapping: {[k: string]: string} = {
        '=0': 'Aucune part.',
        '=1': '1 part.',
        'other': '# parts.'
    }

}

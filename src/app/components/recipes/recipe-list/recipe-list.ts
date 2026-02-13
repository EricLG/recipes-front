import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

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

    public recipes$!: Observable<RecipeDto[]>

    private readonly seasonEmojiMap: Record<RecipeSeason, string> = {
        [RecipeSeason.SPRING]: '✿',
        [RecipeSeason.SUMMER]: '☼',
        [RecipeSeason.AUTUMN]: '🍂',
        [RecipeSeason.WINTER]: '❄',
        [RecipeSeason.ALL_YEAR]: '🌍',
    };

    private readonly allSeasons: RecipeSeason[] = [
        RecipeSeason.SPRING,
        RecipeSeason.SUMMER,
        RecipeSeason.AUTUMN,
        RecipeSeason.WINTER,
    ];

    constructor(private svc: RecipeService) {
        this.recipes$ = this.svc.getAll();
    }

    public getSeasonEmoji(season: RecipeSeason): string {
        return this.seasonEmojiMap[season] || '?';
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

}

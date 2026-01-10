import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Recipe } from '../../../models/recipe';
import { RecipeService } from '../recipe.service';

@Component({
    selector: 'recipe-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-list.html',
    styleUrls: ['./recipe-list.scss'],
})
export class RecipeList {

    public recipes$!: Observable<Recipe[]>

    constructor(private svc: RecipeService) {
        this.recipes$ = this.svc.getAll();
    }

}

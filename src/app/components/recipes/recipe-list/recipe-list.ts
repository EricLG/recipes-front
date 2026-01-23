import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { RecipeService } from '../recipe.service';
import { RecipeDto } from './../../../models/recipe';

@Component({
    selector: 'recipe-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-list.html',
    styleUrls: ['./recipe-list.scss'],
})
export class RecipeList {

    public recipes$!: Observable<RecipeDto[]>

    constructor(private svc: RecipeService) {
        this.recipes$ = this.svc.getAll();
    }

}

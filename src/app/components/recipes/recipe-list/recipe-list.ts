import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

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

    constructor(private svc: RecipeService) {
        this.recipes$ = this.svc.getAll();
    }

}

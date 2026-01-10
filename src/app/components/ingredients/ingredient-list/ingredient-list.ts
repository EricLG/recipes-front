import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ingredient } from '../../../../models/ingredient';
import { IngredientService } from '../../../services/ingredient.service';

@Component({
    selector: 'app-ingredient-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './ingredient-list.html',
    styleUrls: ['./ingredient-list.scss'],
})
export class IngredientList {

    public ingredients$!: Observable<ingredient[]>

    constructor(private svc: IngredientService) {
        this.ingredients$ = this.svc.getAll();
    }

}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { FoodDto } from './../../../models/food';
import { FoodService } from './../food.service';

@Component({
    selector: 'app-foods-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './foods-list.html',
    styleUrls: ['./foods-list.scss'],
})
export class FoodsList {

    public food$!: Observable<FoodDto[]>

    constructor(private svc: FoodService) {
        this.food$ = this.svc.getAll();
    }

    get kiloCalories() {
        let total = 0;
        this.food$.subscribe(foods => {
            total = foods.reduce((sum, food) => sum + food.nutrientsPer100.energyKcal, 0);
        });
        return total;
    }
}

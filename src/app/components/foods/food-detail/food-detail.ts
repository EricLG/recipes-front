import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';

import { MeasureService } from '../measure.service';
import { FoodDto, MeasureDto } from './../../../models/food';
import { FoodService } from './../food.service';

@Component({
    selector: 'app-food-detail',
    imports: [],
    templateUrl: './food-detail.html',
    styleUrl: './food-detail.scss',
})
export class FoodDetail {

    private route = inject(ActivatedRoute);
    private foodSvc = inject(FoodService);
    private measureSvc = inject(MeasureService);
    private router = inject(Router);

    public readonly food = toSignal<FoodDto | undefined>(
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            filter((id): id is string => id !== null),
            switchMap(id => this.foodSvc.getById(id))
        ),
        { initialValue: undefined }
    );

    public readonly measures = toSignal<MeasureDto[] | undefined>(
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            filter((id): id is string => id !== null),
            switchMap(id => this.measureSvc.getAllMeasuresByFoodId(id))
        ),
        { initialValue: undefined }
    );

    public remove(): void {
        const food = this.food();
        if (!food) return;

        if (confirm('Supprimer cet ingrédient ?')) {
            this.foodSvc.delete(food.id).subscribe({
                next: () => this.router.navigate(['/']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }
}

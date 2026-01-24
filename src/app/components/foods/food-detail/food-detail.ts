import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, distinctUntilChanged, exhaustMap, filter, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs';

import { MeasureForm } from '../measure-form/measure-form';
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
    private modalService = inject(NgbModal);
    private refreshSubject = new BehaviorSubject<void>(undefined);

    private readonly foodId$ = this.route.paramMap.pipe(
        map(params => params.get('id')),
        filter((id): id is string => id !== null),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }) // cache the latest id
    );


    public readonly food = toSignal<FoodDto | undefined>(
        this.foodId$.pipe(
            switchMap(id => {
                return this.foodSvc.getById(id)
            })
        ),
        { initialValue: undefined }
    );

    public readonly measures = toSignal<MeasureDto[] | undefined>(
        this.refreshSubject.pipe(
            startWith(void 0),
            withLatestFrom(this.foodId$),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            exhaustMap(([_, id]) => // for each refresh, get the current food id
                this.measureSvc.getAllMeasuresByFoodId(id)
            )
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

    public edit(): void {
        const food = this.food();
        if (!food) return;

        this.router.navigate(['/foods/edit', food.id]);
    }

    public addMeasure(): void {
        const foodId = this.food()?.id;
        if (!foodId) return;

        const modalRef = this.modalService.open(MeasureForm, { centered: true });
        modalRef.componentInstance.foodId = foodId;

        modalRef.result.then((result) => {
            if (result === 'saved' || result === 'deleted') {
                this.refreshMeasures();
            }
        }).catch(() => {});
    }

    public editMeasure(measure: MeasureDto): void {
        const foodId = this.food()?.id;
        if (!foodId) return;

        const modalRef = this.modalService.open(MeasureForm, { centered: true });
        modalRef.componentInstance.measure = measure;
        modalRef.componentInstance.foodId = foodId;

        modalRef.result.then((result) => {
            if (result === 'saved' || result === 'deleted') {
                this.refreshMeasures();
            }
        }).catch(() => {});
    }

    private refreshMeasures(): void {
        this.refreshSubject.next();
    }
}

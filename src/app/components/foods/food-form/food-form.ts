import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { categoryTranslations, FoodCategory } from '../../../enums/food.enum';
import { FoodDto, MeasureDto } from '../../../models/food';
import { FoodService } from '../food.service';

@Component({
    selector: 'app-food-form',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
    ],
    templateUrl: './food-form.html',
    styleUrl: './food-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodForm {

    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private svcFood = inject(FoodService);

    private readonly id$ = this.route.paramMap.pipe(
        map(p => p.get('id')),
        filter((id): id is string => id !== null)
    );
    public readonly id = toSignal(this.id$, { initialValue: null });

    private readonly foodWithMeasures$ = this.id$.pipe(
        switchMap(id => id ? this.svcFood.getByIdWithMeasures(id) : of(null))
    );
    public readonly foodWithMeasures = toSignal(this.foodWithMeasures$, { initialValue: null });

    public readonly title = computed(() => this.id() ? 'Modifier un ingrédient' : 'Ajouter un ingrédient');
    public readonly categories = Object.values(FoodCategory).sort((a, b) => categoryTranslations[a].localeCompare(categoryTranslations[b], 'fr'));
    public readonly showNewMeasureForm = signal(false);

    public readonly foodForm = this.fb.group({
        name: ['', Validators.required],
        category: [FoodCategory.OTHER, Validators.required],
        referenceUnit: ['', Validators.required],
        density: [0, [Validators.required, Validators.min(0)]],
        needReview: [false],
        source: ['', Validators.required],
        nutrientsPer100: this.fb.group({
            energyKcal: [0, [Validators.required, Validators.min(0)]],
            proteins: [0, [Validators.required, Validators.min(0)]],
            fats: [0, [Validators.required, Validators.min(0)]],
            carbohydrates: [0, [Validators.required, Validators.min(0)]],
            sugars: [0, [Validators.required, Validators.min(0)]],
            fibers: [0, [Validators.required, Validators.min(0)]],
            salt: [0, [Validators.required, Validators.min(0)]],
            saturatedFattyAcids: [0, [Validators.required, Validators.min(0)]],
        }),
        measures: this.fb.array([]),
    });

    public readonly measuresArray = this.foodForm.get('measures') as FormArray;

    // Populate form when food data is available
    constructor() {
        effect(() => {
            const foodWithMeasures = this.foodWithMeasures();
            if (foodWithMeasures) {
                const { measures, ...foodData } = foodWithMeasures;
                this.foodForm.patchValue(foodData);

                // Clear existing measures
                this.measuresArray.clear();

                // Add existing measures
                measures.forEach(measure => {
                    this.measuresArray.push(this.createMeasureFormGroup(measure));
                });
            }
        });
    }

    private createMeasureFormGroup(measure?: MeasureDto): FormGroup {
        return this.fb.group({
            id: [measure?.id || null],
            label: [measure?.label || '', Validators.required],
            grams: [measure?.grams || 0, [Validators.required, Validators.min(0.1)]],
            isDefault: [measure?.isDefault || false],
        });
    }

    public addNewMeasure(): void {
        this.measuresArray.push(this.createMeasureFormGroup());
        this.showNewMeasureForm.set(true);
    }

    public removeMeasure(index: number): void {
        this.measuresArray.removeAt(index);
    }

    public getCategoryLabel(category: string): string {
        return categoryTranslations[category as FoodCategory] || category;
    }

    public onSubmit(): void {
        if (this.foodForm.invalid) return;

        const data = this.foodForm.value;
        const foodData = {
            name: data.name,
            category: data.category,
            referenceUnit: data.referenceUnit,
            density: data.density,
            needReview: data.needReview,
            nutrientsPer100: data.nutrientsPer100,
            source: data.source,
        } as Omit<FoodDto, 'id'>;

        const measures = (data.measures || []) as MeasureDto[];

        // Normalize measures: remove `id` property when null/undefined so
        // new measures are sent without `id` (REST best practice).
        const measuresPayload = measures.map(m => {
            const copy: Partial<MeasureDto> = { ...m };
            if (copy.id === null || copy.id === undefined || copy.id === '') {
                delete (copy as any).id;
            }
            return copy as MeasureDto;
        });

        const createOrUpdate$ = this.id()
            ? this.svcFood.updateWithMeasures({ ...foodData, id: this.id()! } as FoodDto, measuresPayload)
            : this.svcFood.createWithMeasures(foodData, measuresPayload as Omit<MeasureDto, 'id'>[]);

        createOrUpdate$.subscribe({
            next: (food) => this.router.navigate(['/foods', food.id]),
            error: (err) => console.error('Erreur sauvegarde:', err)
        });
    }

}

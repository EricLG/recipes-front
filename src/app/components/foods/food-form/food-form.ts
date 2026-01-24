import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { FoodDto } from '../../../models/food';
import { FoodService } from '../food.service';
import { FoodCategory } from '../../../enums/food.enum';

@Component({
    selector: 'app-food-form',
    imports: [
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

    // Get food ID from route parameters - using toSignal to convert observable to signal
    private readonly id$ = this.route.paramMap.pipe(
        map(p => p.get('id')),
        filter((id): id is string => id !== null)
    );
    public readonly id = toSignal(this.id$, { initialValue: null });

    // Fetch food data if editing an existing food
    private readonly food$ = this.id$.pipe(
        switchMap(id => id ? this.svcFood.getById(id) : of(null))
    );
    public readonly food = toSignal(this.food$, { initialValue: null });

    // Dynamic title based on whether adding or editing
    public readonly title = computed(() => this.id() ? 'Modifier un ingrédient' : 'Ajouter un ingrédient');

    // Enums for dropdowns
    public readonly categories = Object.values(FoodCategory);

    public readonly foodForm = this.fb.group({
        name: ['', Validators.required],
        category: [FoodCategory.OTHERS, Validators.required],
        referenceUnit: ['', Validators.required],
        density: [0, [Validators.required, Validators.min(0)]],
        needReview: [false],
        nutrientsPer100: this.fb.group({
            energyKcal: [0, [Validators.required, Validators.min(0)]],
            proteins: [0, [Validators.required, Validators.min(0)]],
            fats: [0, [Validators.required, Validators.min(0)]],
            carbohydrates: [0, [Validators.required, Validators.min(0)]],
            sugars: [0, [Validators.required, Validators.min(0)]],
            fibers: [0, [Validators.required, Validators.min(0)]],
            salt: [0, [Validators.required, Validators.min(0)]],
        }),
    });

    // Populate form when food data is available
    constructor() {
        effect(() => {
            const food = this.food();
            if (food) {
                this.foodForm.patchValue(food);
            }
        });
    }

    onSubmit(): void {
        if (this.foodForm.invalid) return;

        const data = this.foodForm.value;
        const createOrUpdate$ = this.id() ? this.svcFood.update({ ...data, id: this.id()! } as FoodDto) : this.svcFood.create(data as Omit<FoodDto, 'id'>)

        createOrUpdate$.subscribe({
            next: (food) => this.router.navigate(['/foods', food.id]),
            error: (err) => console.error('Erreur sauvegarde:', err)
        });
    }
}

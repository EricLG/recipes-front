import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MeasureDto } from '../../../models/food';
import { MeasureService } from '../measure.service';

@Component({
    selector: 'app-measure-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './measure-form.html',
    styleUrl: './measure-form.scss',
})
export class MeasureForm implements OnInit {
    private fb = inject(FormBuilder);
    private measureSvc = inject(MeasureService);
    private activeModal = inject(NgbActiveModal);

    public measure?: MeasureDto;
    public foodId?: string;

    saveEvent = output<MeasureDto>();
    cancelEvent = output<void>();

    form: FormGroup = this.fb.group({
        label: ['', Validators.required],
        grams: [0, [Validators.required, Validators.min(0.1)]],
        isDefault: [false],
    });

    ngOnInit() {
        if (this.measure) {
            this.form.patchValue(this.measure);
        }
    }

    save() {
        if (this.form.valid && this.foodId) {
            const formValue = this.form.value;
            const measureData: Omit<MeasureDto, 'id'> = {
                foodId: this.foodId,
                label: formValue.label,
                grams: formValue.grams,
                isDefault: formValue.isDefault,
            };

            if (this.measure) {
                // update
                const updatedMeasure = { ...this.measure, ...measureData };
                this.measureSvc.update(updatedMeasure).subscribe({
                    next: (result) => {
                        this.saveEvent.emit(result);
                        this.activeModal.close('saved');
                    },
                    error: (err) => console.error('Erreur sauvegarde:', err),
                });
            } else {
                // create
                this.measureSvc.create(measureData).subscribe({
                    next: (result) => {
                        this.saveEvent.emit(result);
                        this.activeModal.close('saved');
                    },
                    error: (err) => console.error('Erreur création:', err),
                });
            }
        }
    }

    delete() {
        if (this.measure && confirm('Supprimer cette portion ?')) {
            this.measureSvc.delete(this.measure.id).subscribe({
                next: () => {
                    this.activeModal.close('deleted');
                },
                error: (err) => console.error('Erreur suppression:', err),
            });
        }
    }

    cancel() {
        this.cancelEvent.emit();
        this.activeModal.dismiss('cancelled');
    }
}
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, signal } from '@angular/core';

import { AuthService } from '../../../auth/auth.service';
import { currentWeek } from '../../../utils/week';
import { WeeklyRecipePlanService } from '../../weekly-recipe-plan/weekly-recipe-plan.service';

@Component({
    selector: 'app-add-to-week',
    templateUrl: './add-to-week.html',
    styleUrl: './add-to-week.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToWeek implements OnChanges {

    @Input({ required: true }) public recipeId!: string;
    @Input() public compact = false;
    public readonly auth = inject(AuthService);
    private readonly service = inject(WeeklyRecipePlanService);
    public readonly busy = signal(false);
    public readonly message = signal('');
    public readonly added = signal(false);

    public ngOnChanges(): void {
        this.message.set('');
        this.added.set(false);
        this.busy.set(false);
    }

    public add(): void {
        if (this.busy()) return;
        const recipeId = this.recipeId;
        this.busy.set(true);
        this.message.set('');
        this.service.add(currentWeek(), this.recipeId).subscribe({
            next: () => {
                if (this.recipeId !== recipeId) return;
                this.busy.set(false); this.added.set(true); this.message.set('Recette ajoutée à la semaine en cours.');
            },
            error: error => {
                if (this.recipeId !== recipeId) return;
                this.busy.set(false);
                this.added.set(error instanceof HttpErrorResponse && error.status === 409);
                this.message.set(error instanceof HttpErrorResponse ? error.error?.message ?? 'Impossible de joindre le serveur.' : 'Ajout impossible.');
            },
        });
    }

}

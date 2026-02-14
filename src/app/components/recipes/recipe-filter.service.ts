import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { RecipeFilterDto } from '../../models/recipe';

@Injectable({ providedIn: 'root' })
export class RecipeFilterService {

    private readonly filterSubject = new BehaviorSubject<RecipeFilterDto>({});
    readonly filter$ = this.filterSubject.asObservable();

    setFilter(filter: RecipeFilterDto): void {
        this.filterSubject.next(filter);
    }

    getFilter(): RecipeFilterDto {
        return this.filterSubject.value;
    }

    resetFilter(): void {
        this.filterSubject.next({});
    }

}

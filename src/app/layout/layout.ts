import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbDropdownModule, NgbNavModule, NgbOffcanvasModule } from "@ng-bootstrap/ng-bootstrap";

import { SearchFilters } from "../components/search-filters/search-filters";
import { RecipeFilterService } from "../components/recipes/recipe-filter.service";

@Component({
    selector: 'layout',
    templateUrl: './layout.html',
    styleUrls: ['./layout.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        NgbNavModule,
        NgbDropdownModule,
        NgbOffcanvasModule,
        SearchFilters
    ]
})
export class Layout {

    public links = [
        { title: 'Recettes', path: 'recipes' },
        { title: 'Ingrédients', path: 'foods' }
    ];

    public isSidebarOpen = signal(false);

    private readonly filterService = inject(RecipeFilterService);
    private readonly router = inject(Router);

    public goToAllRecipes(): void {
        this.filterService.resetFilter();
        this.router.navigate(['/recipes']);
    }

    constructor(
        public route: ActivatedRoute
    ) {}

    public toggleSidebar(): void {
        this.isSidebarOpen.update(v => !v);
    }

    public closeSidebar(): void {
        this.isSidebarOpen.set(false);
    }

}

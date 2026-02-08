import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NgbDropdownModule, NgbNavModule, NgbOffcanvasModule } from "@ng-bootstrap/ng-bootstrap";

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
    ]
})
export class Layout {

    public links = [
        { title: 'Recettes', path: 'recipes' },
        { title: 'Ingrédients', path: 'foods' }
    ];

    public isSidebarOpen = signal(false);

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

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NgbDropdownModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'layout',
    templateUrl: './layout.html',
    styleUrls: ['./layout.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        CommonModule,
        RouterModule,
        NgbNavModule,
        NgbDropdownModule,
    ]
})
export class Layout {

    public links = [
        { title: 'Recettes', path: 'recipes' },
        { title: 'Foods', path: 'foods' }
    ];

    constructor(
        public route: ActivatedRoute
    ) {}
}

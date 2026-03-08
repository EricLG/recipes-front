import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";

import { IconSize, LinkStyle } from "../../../types/common";
import { Icon } from "../icon/icon";

@Component({
    selector: 'app-link',
    templateUrl: './link.html',
    styleUrls: ['./link.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        Icon,
    ]
})
export class Link implements OnInit {

    @Input({ required: true }) routerLink!: string|string[]
    @Input({ required: true }) label!: string
    @Input() iconOnly = false
    @Input() iconName?: string
    @Input() iconSize: IconSize = 'l'
    @Input() display: LinkStyle = 'default'
    @Input() classes = ''

    ngOnInit(): void {
        switch (this.display) {
            case 'btn': {
                this.classes += 'btn btn-cream py-2'
                break;
            }
            case 'list': {
                this.classes += 'nav-link'
                break;
            }
            default: {
                break;
            }
        }
    }

}

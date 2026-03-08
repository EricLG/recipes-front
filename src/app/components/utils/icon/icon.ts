import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { IconSize } from "../../../types/common";

@Component({
    selector: 'app-icon',
    templateUrl: './icon.html',
    styleUrls: ['./icon.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class Icon {

    @Input({ required: true }) name!: string
    @Input({ required: true }) alt!: string
    @Input() size: IconSize = 'm'

    protected readonly _size: Record<IconSize, number> = {
        xs: 16,
        s: 20,
        m: 24,
        l: 28,
        xl: 32,
        xxl: 36,
    }

}

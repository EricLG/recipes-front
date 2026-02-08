import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { Layout } from './layout/layout';

@Component({
    selector: 'app-root',
    imports: [Layout],
    templateUrl: './app.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

    protected readonly title = signal('La taverne de May');

}

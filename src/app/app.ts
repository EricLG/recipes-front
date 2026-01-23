import { Component, signal } from '@angular/core';

import { Layout } from './layout/layout';

@Component({
    selector: 'app-root',
    imports: [Layout],
    templateUrl: './app.html',
    styles: [],
})
export class App {

    protected readonly title = signal('La taverne de May');

}

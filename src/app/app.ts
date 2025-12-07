import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Recettes</a>
      </div>
    </nav>

    <router-outlet />
  `,
    styles: [],
})
export class App {
    protected readonly title = signal('recipes');
}

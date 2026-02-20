import { Component } from "@angular/core";

@Component({
    selector: 'not-found',
    template: `
        <div class="container not-found">
            <h2>404 — Page non trouvée</h2>
            <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
            <img src="assets/coming_soon.jpg" alt="Work in progress" width="500">
            <p><a routerLink="/">Retour à l'accueil</a></p>
        </div>
    `,
    styles: `
        .not-found { padding: 3rem; text-align: center; }
        .not-found h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .not-found a { color: #1976d2; text-decoration: none; }
    `,
    imports: []
})
export class NotFound { }
// TODO : add a more relevant image for 404 page

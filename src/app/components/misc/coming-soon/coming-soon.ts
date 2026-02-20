import { Component } from "@angular/core";

@Component({
    selector: 'coming-soon',
    template: `
        <div class="container coming-soon">
            <h2>Page en construction</h2>
            <p>Cette fonctionnalité est en cours de développement. Revenez bientôt.</p>
            <img src="assets/coming_soon.jpg" alt="Work in progress" width="500">
            <p><a routerLink="/">Retour à l'accueil</a></p>
        </div>
    `,
    styles: `
        .coming-soon { padding: 3rem; text-align: center; }
        .coming-soon h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .coming-soon a { color: #1976d2; text-decoration: none; }
    `,
    imports: []
})
export class ComingSoon { }

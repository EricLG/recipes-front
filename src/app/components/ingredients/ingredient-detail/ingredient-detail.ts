import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ingredient } from '../../../../models/ingredient';
import { IngredientService } from '../../../services/ingredient.service';

@Component({
    selector: 'app-ingredient-detail',
    imports: [CommonModule],
    templateUrl: './ingredient-detail.html',
    styleUrl: './ingredient-detail.scss',
})
export class IngredientDetail {

    public ingredient: ingredient | undefined;
    public id: string;

    constructor(
        private route: ActivatedRoute,
        private svc: IngredientService,
        private router: Router
    ) {
        const param = this.route.snapshot.paramMap.get('id');
        this.id = param ? param : '';
    }

    ngOnInit() {
        this.svc.getById(this.id).subscribe({
            next: (data) => this.ingredient = data,
            error: (err) => console.error('Erreur chargement ingrédient:', err)
        });
    }

    remove() {
        if (!this.ingredient) return;
        if (confirm('Supprimer cet ingrédient ?')) {
            this.svc.delete(this.ingredient.id).subscribe({
                next: () => this.router.navigate(['/']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }
}

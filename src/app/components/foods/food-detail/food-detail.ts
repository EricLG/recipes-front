import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FoodDto } from './../../../models/food';
import { FoodService } from './../food.service';

@Component({
    selector: 'app-food-detail',
    imports: [CommonModule],
    templateUrl: './food-detail.html',
    styleUrl: './food-detail.scss',
})
export class FoodDetail {

    public food?: FoodDto;
    public id: string;

    constructor(
        private route: ActivatedRoute,
        private svc: FoodService,
        private router: Router
    ) {
        const param = this.route.snapshot.paramMap.get('id');
        this.id = param ? param : '';
    }

    ngOnInit() {
        this.svc.getById(this.id).subscribe({
            next: (data) => this.food = data,
            error: (err) => console.error('Erreur chargement ingrédient:', err)
        });
    }

    remove() {
        if (!this.food) return;
        if (confirm('Supprimer cet ingrédient ?')) {
            this.svc.delete(this.food.id).subscribe({
                next: () => this.router.navigate(['/']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }
}

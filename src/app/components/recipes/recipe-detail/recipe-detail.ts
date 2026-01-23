import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeDto } from './../../../models/recipe';
import { RecipeService } from './../recipe.service';

@Component({
    selector: 'recipe-detail',
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-detail.html',
    styleUrls: ['./recipe-detail.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class RecipeDetail implements OnInit {
    recipe: RecipeDto | undefined;
    id: string;

    constructor(
        private route: ActivatedRoute,
        private svc: RecipeService,
        private router: Router,
        private cdref: ChangeDetectorRef,
    ) {
        const param = this.route.snapshot.paramMap.get('id');
        this.id = param ? param : '';
    }

    ngOnInit() {
        this.svc.getById(this.id).subscribe({
            next: (data) => {
                this.recipe = data
                this.cdref.markForCheck();
            },
            error: (err) => console.error('Erreur chargement recette:', err),
        });
    }

    remove() {
        if (!this.recipe) return;
        if (confirm('Supprimer cette recette ?')) {
            this.svc.delete(this.recipe.id).subscribe({
                next: () => this.router.navigate(['/']),
                error: (err) => console.error('Erreur suppression:', err)
            });
        }
    }
}

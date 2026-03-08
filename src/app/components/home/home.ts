import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

import { RecipeFilterService } from "../recipes/recipe-filter.service";

@Component({
    selector: 'home',
    template: '<div class="container"><h1>Bienvenue sur le site de recettes</h1></div>',
    styles: '',
    imports: []
})
export class Home {

    private readonly svcRecipeFilter = inject(RecipeFilterService);
    private readonly router = inject(Router);

    constructor() {
        this.svcRecipeFilter.resetFilter()
        this.router.navigate(['recipes'])
    }

}

import { Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list.component';
import { RecipeDetailComponent } from './recipe-detail.component';
import { RecipeFormComponent } from './recipe-form.component';

export const routes: Routes = [
    { path: '', component: RecipeListComponent },
    { path: 'recipe/:id', component: RecipeDetailComponent },
    { path: 'add', component: RecipeFormComponent },
    { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { IngredientDetail } from './components/ingredients/ingredient-detail/ingredient-detail';
import { IngredientList } from './components/ingredients/ingredient-list/ingredient-list';
import { RecipeDetail } from './components/recipes/recipe-detail/recipe-detail';
import { RecipeForm } from './components/recipes/recipe-form/recipe-form';
import { RecipeList } from './components/recipes/recipe-list/recipe-list';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'recipes', component: RecipeList },
    { path: 'recipes/:id', component: RecipeDetail },
    { path: 'ingredients', component: IngredientList },
    { path: 'ingredients/:id', component: IngredientDetail },
    { path: 'add', component: RecipeForm },
    { path: '**', redirectTo: '' },
];

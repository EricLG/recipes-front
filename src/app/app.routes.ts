import { Routes } from '@angular/router';

import { FoodDetail } from './components/foods/food-detail/food-detail';
import { FoodForm } from './components/foods/food-form/food-form';
import { FoodsList } from './components/foods/foods-list/foods-list';
import { Home } from './components/home/home';
import { RecipeDetail } from './components/recipes/recipe-detail/recipe-detail';
import { RecipeForm } from './components/recipes/recipe-form/recipe-form';
import { RecipeList } from './components/recipes/recipe-list/recipe-list';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'recipes', component: RecipeList },
    { path: 'recipes/add', component: RecipeForm },
    { path: 'recipes/:id', component: RecipeDetail },
    { path: 'foods', component: FoodsList },
    { path: 'foods/add', component: FoodForm },
    { path: 'foods/edit/:id', component: FoodForm },
    { path: 'foods/:id', component: FoodDetail },
    { path: '**', redirectTo: '' },
];

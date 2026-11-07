import { Routes } from '@angular/router';

import { authGuard, loggedInGuard } from './auth/auth.guard';
import { FoodDetail } from './components/foods/food-detail/food-detail';
import { FoodForm } from './components/foods/food-form/food-form';
import { FoodsList } from './components/foods/foods-list/foods-list';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { ComingSoon } from './components/misc/coming-soon/coming-soon';
import { NotFound } from './components/misc/not-found/not-found';
import { NutrionnalsValues } from './components/nutritionnals-values/nutrionnals-values';
import { Profile } from './components/profile/profile';
import { RecipeDetail } from './components/recipes/recipe-detail/recipe-detail';
import { RecipeForm } from './components/recipes/recipe-form/recipe-form';
import { RecipeList } from './components/recipes/recipe-list/recipe-list';
import { WeeklyRecipePlan } from './components/weekly-recipe-plan/weekly-recipe-plan';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'recipes', component: RecipeList },
    { path: 'weekly-plan', component: WeeklyRecipePlan, canActivate: [loggedInGuard], canDeactivate: [(component: WeeklyRecipePlan) => component.canDeactivate()], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
    { path: 'shopping-list', canActivate: [loggedInGuard], canDeactivate: [(component: { canDeactivate: () => boolean }) => component.canDeactivate()], runGuardsAndResolvers: 'paramsOrQueryParamsChange', loadComponent: () => import('./components/shopping-list/shopping-list').then(module => module.ShoppingList) },
    { path: 'recipes/add', component: RecipeForm, canActivate: [authGuard] },
    { path: 'recipes/edit/:id', component: RecipeForm, canActivate: [authGuard] },
    { path: 'recipes/:id', component: RecipeDetail },
    { path: 'foods', component: FoodsList },
    { path: 'foods/add', component: FoodForm, canActivate: [authGuard] },
    { path: 'foods/edit/:id', component: FoodForm, canActivate: [authGuard] },
    { path: 'foods/:id', component: FoodDetail },
    { path: 'profile', component: Profile, canActivate: [loggedInGuard] },
    { path: 'nutritionnals-values', component: NutrionnalsValues },
    { path: 'coming-soon', component: ComingSoon },
    { path: '**', component: NotFound },
];

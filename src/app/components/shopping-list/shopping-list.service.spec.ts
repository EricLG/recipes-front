import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ReplaceShoppingListRequest, ShoppingListItem, ShoppingListResponse, ShoppingListService } from './shopping-list.service';
import { FoodCategory } from '../../enums/food.enum';
import { RecipeCategory, RecipeStatus, RecipeVegetarianStatus } from '../../enums/recipes.enum';
import { DetailedRecipeDTO } from '../../models/recipe';

function detailRecipe(): DetailedRecipeDTO {
    return {
        id: 'recipe-1',
        name: 'Soupe',
        status: RecipeStatus.APPROVED,
        instructions: '',
        vegetarianStatus: RecipeVegetarianStatus.FLEXIBLE,
        season: [],
        category: RecipeCategory.MAIN,
        servings: 4,
        imageUrl: '',
        recipeFoods: [
            {
                id: 'ingredient-1',
                recipeId: 'recipe-1',
                quantity: 100,
                food: {
                    id: 'potato',
                    name: 'Pomme de terre',
                    category: FoodCategory.STARCHES,
                    nutrientsPer100: {
                        energyKcal: 0,
                        proteins: 0,
                        fats: 0,
                        carbohydrates: 0,
                        sugars: 0,
                        fibers: 0,
                        salt: 0,
                        saturatedFattyAcids: 0,
                    },
                    needReview: false,
                    source: '',
                },
                measure: { id: 'gram', foodId: 'potato', label: 'g', grams: 1, isDefault: true },
            }
        ],
        recipeSubRecipes: [],
    };
}

describe('ShoppingListService', () => {
    let service: ShoppingListService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(ShoppingListService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTestingController.verify());

    it('définit les deux magasins par défaut sous forme de chaînes', () => {
        expect(service.defaultStores).toEqual(['Super U', 'Biocoop']);
    });

    it('récupère la liste distante de la semaine', () => {
        let response: ShoppingListResponse | undefined;
        service.getRemoteList('2026-10-19').subscribe(value => response = value);

        const request = httpTestingController.expectOne('/api/shopping-lists/2026-10-19');
        expect(request.request.method).toBe('GET');
        request.flush({ weekStart: '2026-10-19', stores: ['Super U', 'Biocoop'], items: [] });
        expect(response?.stores).toEqual(['Super U', 'Biocoop']);
    });

    it('remplace manuellement la liste avec des magasins et affectations sous forme de chaînes', () => {
        const body: ReplaceShoppingListRequest = {
            stores: ['Super U', 'Biocoop'],
            items: [
                {
                    itemKey: 'potato:g',
                    kind: 'ingredient',
                    foodId: 'potato',
                    foodName: 'Pomme de terre',
                    category: FoodCategory.STARCHES,
                    quantity: 500,
                    unit: 'g',
                    source: 'manual',
                    checked: false,
                    inStock: false,
                    store: 'Super U',
                }
            ],
        };
        service.replaceRemoteList('2026-10-19', body).subscribe();

        const request = httpTestingController.expectOne('/api/shopping-lists/2026-10-19');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual(body);
        request.flush({ weekStart: '2026-10-19', ...body });
    });
    it('scales nested sub-recipes by their yields and keeps different measures separate', () => {
        const parent = detailRecipe();
        const child = detailRecipe(); child.id = 'child'; child.servings = 4;
        parent.recipeSubRecipes = [{ id: 'sub', parentRecipeId: parent.id, childRecipeId: child.id, quantity: 2, childRecipe: child }];
        const result = service.aggregateIngredients([{ recipe: parent, servings: 8 }]);
        expect(result[0].quantity).toBe(300);
        child.recipeFoods[0].measure = { ...child.recipeFoods[0].measure, id: 'pinch', label: 'pincée', grams: 0 };
        expect(service.aggregateIngredients([{ recipe: parent, servings: 4 }])).toHaveLength(2);
    });

    it('keeps eggs in recipe units even when a gram conversion is available', () => {
        const recipe = detailRecipe();
        recipe.recipeFoods[0].food = { ...recipe.recipeFoods[0].food, id: 'egg', name: 'Œufs' };
        recipe.recipeFoods[0].quantity = 2;
        recipe.recipeFoods[0].measure = { id: 'egg-unit', foodId: 'egg', label: 'unité', grams: 60, isDefault: true };
        const items = service.aggregateIngredients([{ recipe, servings: 4 }]);
        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({ key: 'egg:egg-unit', foodId: 'egg', quantity: 2, unit: 'unité' });
        expect(service.aggregateIngredients([{ recipe, servings: 8 }])[0].quantity).toBe(4);
    });

    it('sums matching measures but keeps convertible measures of one food independent', () => {
        const grams = detailRecipe();
        const pieces = detailRecipe();
        pieces.recipeFoods[0].quantity = 2;
        pieces.recipeFoods[0].measure = { id: 'piece', foodId: 'potato', label: 'unité', grams: 150, isDefault: false };
        const ingredients = service.aggregateIngredients([{ recipe: grams, servings: 4 }, { recipe: pieces, servings: 4 }, { recipe: pieces, servings: 4 }]);
        expect(ingredients).toHaveLength(2);
        expect(ingredients.find(item => item.key === 'potato:gram')).toMatchObject({ quantity: 100, unit: 'g' });
        expect(ingredients.find(item => item.key === 'potato:piece')).toMatchObject({ quantity: 4, unit: 'unité' });
        const existing = ingredients.map(item => ({ ...item, checked: item.unit === 'g', inStock: item.unit === 'unité', store: item.unit === 'g' ? 'Super U' : 'Biocoop' }));
        const merged = service.mergeIngredients(existing, ingredients, 'Super U');
        expect(merged.items).toEqual(existing);
        expect(merged).toMatchObject({ added: 0, changed: 0, removed: 0 });
        const updated = ingredients.map(item => item.unit === 'g' ? { ...item, quantity: 200 } : item);
        const refreshed = service.mergeIngredients(existing, updated, 'Super U');
        expect(refreshed.items.find(item => item.unit === 'g')).toMatchObject({ quantity: 200, checked: false, store: 'Super U' });
        expect(refreshed.items.find(item => item.unit === 'unité')).toEqual(existing.find(item => item.unit === 'unité'));
    });
    it('keeps checked unchanged ingredients but unchecks changed quantities', () => {
        const ingredients = service.aggregateIngredients([{ recipe: detailRecipe(), servings: 4 }]);
        const existing = [{ ...ingredients[0], checked: true, inStock: false, store: 'Biocoop' }];
        expect(service.mergeIngredients(existing, ingredients, 'Super U').items[0].checked).toBe(true);
        const changed = ingredients.map(item => ({ ...item, quantity: 200 }));
        const result = service.mergeIngredients(existing, changed, 'Super U');
        expect(result.items[0]).toMatchObject({ checked: false, store: 'Biocoop', quantity: 200 });
        expect(result.changed).toBe(1);
        expect(service.mergeIngredients(existing, [], 'Super U').removed).toBe(1);
    });

    it('preserves manual ingredients and free items when the plan no longer needs them', () => {
        const [ingredient] = service.aggregateIngredients([{ recipe: detailRecipe(), servings: 4 }]);
        const manual: ShoppingListItem = { ...ingredient, source: 'manual', checked: false, inStock: true, store: 'Biocoop' };
        const planned: ShoppingListItem = { ...ingredient, key: 'other:gram', foodId: 'other', checked: true, inStock: false, store: 'Super U' };
        const free: ShoppingListItem = { key: 'free:1', kind: 'free', name: 'Piles', checked: false, inStock: false, store: 'Super U' };
        const result = service.mergeIngredients([manual, planned, free], [], 'Super U');
        expect(result.items).toEqual([manual, free]);
        expect(result).toMatchObject({ added: 0, changed: 0, removed: 1 });
    });

    it('restores planning quantities without duplicating a matching manual ingredient', () => {
        const ingredients = service.aggregateIngredients([{ recipe: detailRecipe(), servings: 4 }]);
        const manual: ShoppingListItem = { ...ingredients[0], source: 'manual', quantity: 42, checked: true, inStock: false, store: 'Biocoop' };
        const result = service.mergeIngredients([manual], ingredients, 'Super U');
        expect(result.items).toEqual([{ ...manual, quantity: 100, checked: false }]);
        expect(result).toMatchObject({ added: 0, changed: 1, removed: 0, changedKeys: [manual.key] });
        expect(service.mergeIngredients(result.items, ingredients, 'Super U')).toMatchObject({ added: 0, changed: 0, removed: 0 });
        expect(service.mergeIngredients(result.items, [], 'Super U').items).toEqual(result.items);
    });

});

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { FOOD_CATEGORY_ORDER, FoodCategory } from '../../enums/food.enum';
import { DetailedRecipeDTO } from '../../models/recipe';

export interface ShoppingListItem {
    key: string;
    kind: 'ingredient' | 'free';
    foodId?: string;
    name: string;
    category?: FoodCategory;
    quantity?: number;
    unit?: string;
    checked: boolean;
    inStock: boolean;
    store: string;
}

export interface PlannedRecipeIngredients {
    recipe: DetailedRecipeDTO;
    servings: number;
}

export interface ShoppingListApiItem {
    itemKey: string;
    kind: 'ingredient' | 'free';
    foodId?: string;
    foodName: string;
    category?: FoodCategory;
    quantity?: number;
    unit?: string;
    checked: boolean;
    inStock: boolean;
    store: string;
}

export interface ShoppingListResponse {
    weekStart: string;
    stores: string[];
    items: ShoppingListApiItem[];
}

export interface ReplaceShoppingListRequest {
    stores: string[];
    items: ShoppingListApiItem[];
}

const DEFAULT_STORES = ['Super U', 'Biocoop'];

@Injectable({ providedIn: 'root' })
export class ShoppingListService {

    private readonly http = inject(HttpClient);
    public readonly defaultStores = DEFAULT_STORES;

    public getPreferences() {
        return this.http.get<{ stores: string[] }>('/api/shopping-lists/preferences/stores');
    }

    public getRemoteList(weekStart: string) {
        return this.http.get<ShoppingListResponse>(`/api/shopping-lists/${weekStart}`);
    }

    public replaceRemoteList(weekStart: string, request: ReplaceShoppingListRequest) {
        return this.http.put<ShoppingListResponse>(`/api/shopping-lists/${weekStart}`, request);
    }

    public mergeIngredients(existing: ShoppingListItem[], ingredients: Omit<ShoppingListItem, 'checked' | 'inStock' | 'store'>[], defaultStore: string) {
        const old = new Map(existing.filter(item => item.kind === 'ingredient').map(item => [item.key, item]));
        let added = 0;
        let changed = 0;
        const changedKeys: string[] = [];
        const items = ingredients.map(ingredient => {
            const previous = old.get(ingredient.key);
            old.delete(ingredient.key);
            if (!previous) {
                added++;
                return { ...ingredient, checked: false, inStock: false, store: defaultStore };
            }
            const quantityChanged = Math.abs((previous.quantity ?? 0) - (ingredient.quantity ?? 0)) > 1e-9 || previous.unit !== ingredient.unit;
            if (quantityChanged) {
                changed++; changedKeys.push(ingredient.key);
            }
            return { ...ingredient, checked: quantityChanged ? false : previous.checked, inStock: previous.inStock, store: previous.store };
        });
        return { items: [...items, ...existing.filter(item => item.kind === 'free')], added, changed, removed: old.size, changedKeys };
    }

    public aggregateIngredients(entries: PlannedRecipeIngredients[]): Omit<ShoppingListItem, 'checked' | 'inStock' | 'store'>[] {
        const quantities = new Map<string, Omit<ShoppingListItem, 'checked' | 'inStock' | 'store'>>();
        const addRecipe = (recipe: DetailedRecipeDTO, servingsFactor: number): void => {
            for (const ingredient of recipe.recipeFoods) {
                const unit = ingredient.measure.label;
                const key = `${ingredient.food.id}:${ingredient.measure.id}`;
                const current = quantities.get(key);
                const quantity = ingredient.quantity * servingsFactor;
                if (current) {
                    current.quantity = (current.quantity ?? 0) + quantity;
                } else {
                    quantities.set(key, {
                        key,
                        kind: 'ingredient',
                        foodId: ingredient.food.id,
                        name: ingredient.food.name,
                        category: ingredient.food.category,
                        quantity,
                        unit,
                    });
                }
            }
            for (const subRecipe of recipe.recipeSubRecipes) {
                addRecipe(subRecipe.childRecipe, servingsFactor * subRecipe.quantity / Math.max(subRecipe.childRecipe.servings, 1));
            }
        };

        for (const { recipe, servings } of entries) {
            addRecipe(recipe, servings / Math.max(recipe.servings, 1));
        }

        return [...quantities.values()].sort((left, right) =>
            FOOD_CATEGORY_ORDER.indexOf(left.category!) - FOOD_CATEGORY_ORDER.indexOf(right.category!) ||
            left.name.localeCompare(right.name, 'fr') ||
            (left.unit ?? '').localeCompare(right.unit ?? '', 'fr') ||
            left.key.localeCompare(right.key)
        );
    }

}

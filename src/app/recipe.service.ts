import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe';

const STORAGE_KEY = 'recipes_data_v1';

@Injectable({ providedIn: 'root' })
export class RecipeService {
    private loadStorage(): Recipe[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) as Recipe[] : [];
        } catch {
            return [];
        }
    }

    private saveStorage(items: Recipe[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    getAll(): Recipe[] {
        return this.loadStorage();
    }

    getById(id: number): Recipe | undefined {
        return this.getAll().find(r => r.id === id);
    }

    create(recipe: Omit<Recipe, 'id'>): Recipe {
        const items = this.getAll();
        const nextId = items.length ? Math.max(...items.map(r => r.id)) + 1 : 1;
        const newItem: Recipe = { ...recipe, id: nextId } as Recipe;
        items.push(newItem);
        this.saveStorage(items);
        return newItem;
    }

    update(recipe: Recipe): Recipe | undefined {
        const items = this.getAll();
        const idx = items.findIndex(r => r.id === recipe.id);
        if (idx === -1) return undefined;
        items[idx] = recipe;
        this.saveStorage(items);
        return recipe;
    }

    delete(id: number): boolean {
        const items = this.getAll();
        const filtered = items.filter(r => r.id !== id);
        if (filtered.length === items.length) return false;
        this.saveStorage(filtered);
        return true;
    }

    async seedFromCsvAsset(path = '/assets/recipes_exemples.csv') {
        try {
            const res = await fetch(path);
            if (!res.ok) return false;
            const text = await res.text();
            const lines = text.split(/\r?\n/).filter(Boolean);
            if (!lines.length) return false;
            // CSV header: Name;nbPart;kcal
            const data = lines.slice(1).map((line, i) => {
                const parts = line.split(';').map(p => p.trim());
                return {
                    id: i + 1,
                    name: parts[0] ?? `Recipe ${i + 1}`,
                    nbParts: Number(parts[1] ?? 1),
                    totalKiloCalories: Number(parts[2] ?? 0),
                    ingredients: [],
                    instructions: '',
                    season: '',
                    vegetarian: false,
                } as Recipe;
            });
            this.saveStorage(data);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
}

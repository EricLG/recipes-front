import { ingredient } from "./ingredient";

interface qtyIngredient {
    ingredient: ingredient;
    quantity?: number;
    unit?: string;

}

export class Recipe {
    id: string;
    name: string;
    ingredients: qtyIngredient[];
    subCourses?: Recipe[];
    instructions: string;
    season?: string;
    vegetarian: boolean;
    nbParts: number;
    category: string;

    constructor(
        id: string,
        name: string,
        ingredients: qtyIngredient[] = [],
        instructions: string = '',
        season: string = '',
        vegetarian: boolean = false,
        nbParts: number = 1,
        category: string = '',
        subCourses?: Recipe[]
    ) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.season = season;
        this.vegetarian = vegetarian;
        this.nbParts = nbParts;
        this.category = category;
        this.subCourses = subCourses;
    }

    get totalKiloCaloriesPerPortion(): number {
        const totalKiloaCalories = this.ingredients.reduce((sum, ing) => {
            const qty = ing.quantity || 1;
            return sum + (ing.ingredient.kiloCalories * qty);
        }, 0);

        return totalKiloaCalories / this.nbParts;
    }

    get totalProteins(): number {
        return this.ingredients.reduce((sum, ing) => {
            const qty = ing.quantity || 1;
            return sum + (ing.ingredient.proteins * qty);
        }, 0);
    }

    get totalFats(): number {
        return this.ingredients.reduce((sum, ing) => {
            const qty = ing.quantity || 1;
            return sum + (ing.ingredient.fats * qty);
        }, 0);
    }

    get totalCarbohydrates(): number {
        return this.ingredients.reduce((sum, ing) => {
            const qty = ing.quantity || 1;
            return sum + (ing.ingredient.carbohydrates * qty);
        }, 0);
    }

    get totalFibers(): number {
        return this.ingredients.reduce((sum, ing) => {
            const qty = ing.quantity || 1;
            return sum + (ing.ingredient.fibers * qty);
        }, 0);
    }
}

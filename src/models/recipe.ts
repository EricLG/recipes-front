import { ingredient } from "./ingredient";

interface qtyIngredient {
    ingredient: ingredient;
    quantity?: number;
    unit?: string;

}

export interface Recipe {
    id: number;
    name: string;
    ingredients?: qtyIngredient[];
    instructions?: string;
    season?: string;
    vegetarian?: boolean;
    nbParts?: number;
    totalKiloCaloriesPerPortion?: number;
    totalProteins?: number;
    totalFats?: number;
    totalCarbohydrates?: number;
    totalFibers?: number;

}

import { RecipeCategory, RecipeSeason } from './../enums/recipes.enum';
import { FoodDto } from './food';

export interface RecipeDto {
    id: string;
    name: string;
    instructions: string;
    vegetarian?: boolean;
    season?: RecipeSeason;
    category: RecipeCategory;
    servings: number;
}

export interface RecipeFoodDto {
    recipeId: string;
    foodId: string;
    measureId: string;
    quantity: number;
}

export interface DetailedRecipeDTO {
    id: string;
    name: string;
    instructions: string;
    vegetarian?: boolean;
    season?: RecipeSeason;
    category: RecipeCategory;
    servings: number;
    measures:  {
        recipeId: string;
        quantity: number;
        measureId: {
            label: string;
            grams: number;
            isDefault: boolean;
            foodId: FoodDto
        };
    }[];
}

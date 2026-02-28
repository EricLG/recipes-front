import { RecipeCategory, RecipeSeason, RecipeVegetarianStatus } from './../enums/recipes.enum';
import { FoodDto } from './food';

export interface RecipeDto {
    id: string;
    name: string;
    instructions: string;
    vegetarianStatus: RecipeVegetarianStatus;
    season: RecipeSeason[];
    category: RecipeCategory;
    servings: number;
}

export interface RecipeFoodDto {
    id?: string;
    recipeId: string;
    foodId: string;
    measureId: string;
    quantity: number;
}

export interface RecipeSubRecipeDto {
    id?: string;
    parentRecipeId: string;
    childRecipeId: string;
    quantity: number;
}

export interface DetailedRecipeDTO {
    id: string;
    name: string;
    instructions: string;
    vegetarianStatus: RecipeVegetarianStatus;
    season: RecipeSeason[];
    category: RecipeCategory;
    servings: number;
    recipeFoods: {
        id: string;
        recipeId: string;
        quantity: number;
        food: FoodDto;
        measure: {
            id: string;
            label: string;
            grams: number;
            isDefault: boolean;
            foodId: string;
        };
    }[];
    recipeSubRecipes: {
        id: string;
        parentRecipeId: string;
        childRecipeId: string;
        quantity: number;
        childRecipe: DetailedRecipeDTO;
    }[];
}

// For creating/updating recipe with all relations
export interface RecipeWithRelationsDto extends RecipeDto {
    recipeFoods: (Omit<RecipeFoodDto, 'id'>)[];
    recipeSubRecipes: (Omit<RecipeSubRecipeDto, 'id'>)[];
}

export interface RecipeFilterDto {

    name?: string
    category?: RecipeCategory
    seasons?: RecipeSeason[]
    vegetarianStatus?: RecipeVegetarianStatus[]

}

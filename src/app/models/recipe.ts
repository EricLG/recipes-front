import { RecipeCategory, RecipeSeason } from './../enums/recipes.enum';
import { FoodDto, MeasureDto } from './food';

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

export class RecipeFood {

    public recipeId: string;
    public foodId: FoodDto;
    public measureId: MeasureDto;
    public quantity: number;

    constructor(
        recipeId: string,
        foodId: FoodDto,
        measureId: MeasureDto,
        quantity: number
    ) {
        this.recipeId = recipeId;
        this.foodId = foodId;
        this.measureId = measureId;
        this.quantity = quantity;
    }
}

export interface ResponseRecipeFoodDto {
    recipeId: string;
    foodId: {
        id: string;
        name: string;
        referenceUnit: string;
        density: number;
        nutrientsPer100: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        };
        needReview: boolean;
    };
    measureId: {
        label: string;
        grams: number;
        isDefault: boolean;
    };
    quantity: number;
}

export class FullRecipe {

    public id: string;
    public name: string;
    public instructions: string;
    public vegetarian?: boolean;
    public season?: RecipeSeason;
    public category: RecipeCategory;
    public servings: number;

    // Relations
    public recipeFoods: RecipeFoodDto[];

    // Additional properties
    kiloCalories: number;

    constructor(recipe: RecipeDto, response: ResponseRecipeFoodDto[]) {
        this.id = recipe.id
        this.name = recipe.name
        this.instructions = recipe.instructions
        this.vegetarian = recipe.vegetarian
        this.season = recipe.season
        this.category = recipe.category
        this.servings = recipe.servings
        this.recipeFoods = response.map(r => ({
            recipeId: r.recipeId,
            foodId: r.foodId.id,
            measureId: r.measureId.label,
            quantity: r.quantity
        }));
        this.kiloCalories = this.foodKiloCaloriesTotal();
    }

    foodKiloCaloriesTotal(): number {
        return 0 // this.kiloCalories * this.quantity;
    }
}

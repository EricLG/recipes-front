import { FoodCategory } from './../enums/food.enum';

export interface FoodDto {
    id: string;
    name: string;
    category: FoodCategory;
    referenceUnit: string;
    density: number;
    nutrientsPer100: NutrientsDto;
    needReview: boolean;
    source: string;
}

export interface NutrientsDto {
    energyKcal: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
    sugars: number;
    fibers: number;
    salt: number;
}

export interface MeasureDto {
    id: string;
    foodId: string;
    label: string;
    grams: number;
    isDefault: boolean;
}

// Extended Food DTO with embedded measures for CRUD operations
export interface FoodWithMeasuresDto extends FoodDto {
    measures: MeasureDto[];
}

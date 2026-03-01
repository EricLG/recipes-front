import { FoodCategory } from './../enums/food.enum';

export interface FoodDto {
    id: string;
    name: string;
    category: FoodCategory;
    density: number; // g/mL
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
    saturatedFattyAcids: number;
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

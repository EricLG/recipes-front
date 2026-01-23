export interface FoodDto {
    id: string
    name: string;
    referenceUnit: string;
    density: number;
    nutrientsPer100: NutrientsDto;
    needReview: boolean;
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
    isDefault?: boolean;
}

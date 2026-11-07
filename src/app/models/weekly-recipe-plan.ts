export interface WeeklyRecipePlanItemDto {
    recipeId: string;
    recipeName: string;
    servings: number;
    source: string;
    cookedAt: string | null;
}

export interface WeeklyRecipePlanDto {
    weekStart: string;
    targetServings: number;
    totalServings: number;
    shortage: number;
    surplus: number;
    items: WeeklyRecipePlanItemDto[];
}

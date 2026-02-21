export enum RecipeSeason {
    SPRING = 'spring',
    SUMMER = 'summer',
    AUTUMN = 'autumn',
    WINTER = 'winter',
}

export enum RecipeCategory {
    BREAKFAST = 'breakfast',
    STARTER = 'starter',
    MAIN = 'main', // Default
    SIDE = 'side',
    DESSERT = 'dessert',
    DRINK = 'drink',
    OTHERS = 'others',
}

export enum RecipeVegetarianStatus {
    VEGETARIAN = 'vegetarian',
    NON_VEGETARIAN = 'non_vegetarian',
    FLEXIBLE = 'flexible',
}

export const seasonTranslations: Record<RecipeSeason, string> = {
    spring: "Printemps",
    summer: "Été",
    autumn: "Automne",
    winter: "Hiver",
};

export const recipeCategoryTranslations: Record<RecipeCategory, string> = {
    breakfast: "Petit-déjeuner",
    starter: "Entrée",
    main: "Plat principal",
    side: "Accompagnement",
    dessert: "Dessert",
    drink: "Boisson",
    others: "Autres",
};

export const recipeVegetarianStatusTranslations: Record<RecipeVegetarianStatus, string> = {
    vegetarian: "Végétarien",
    non_vegetarian: "Avec viande",
    flexible: "Flexible",
};

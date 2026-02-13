export enum RecipeSeason {
    ALL_YEAR = 'all_year', // Default
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

export const seasonTranslations: Record<RecipeSeason, string> = {
    all_year: "Toute l'année",
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

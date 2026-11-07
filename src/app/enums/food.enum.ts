// No default option
export enum FoodCategory {
    PLANT_BASED = 'plant_based',
    STARCHES = 'starches',
    ANIMAL_PROTEINS = 'animal_proteins',
    CONDIMENTS = 'condiments',
    BEVERAGES = 'beverages',
    FRUITS = 'fruits',
    SEAFOOD = 'seafood',
    FATS = 'fats',
    OTHER = 'other',
    VEGETABLES = 'vegetables',
    LEGUMES = 'legumes',
    DAIRY = 'dairy',
    SWEET_PRODUCTS = 'sweet_products',
    SUPPLEMENTS = 'supplements',
}

export const FOOD_CATEGORY_ORDER: FoodCategory[] = [
    FoodCategory.STARCHES,
    FoodCategory.ANIMAL_PROTEINS,
    FoodCategory.SEAFOOD,
    FoodCategory.PLANT_BASED,
    FoodCategory.LEGUMES,
    FoodCategory.VEGETABLES,
    FoodCategory.FRUITS,
    FoodCategory.FATS,
    FoodCategory.DAIRY,
    FoodCategory.SWEET_PRODUCTS,
    FoodCategory.BEVERAGES,
    FoodCategory.CONDIMENTS,
    FoodCategory.SUPPLEMENTS,
    FoodCategory.OTHER,
];

export const categoryTranslations: Record<FoodCategory, string> = {
    vegetables: "Légumes",
    fruits: "Fruits",
    legumes: "Légumineuses",
    starches: "Féculents",
    animal_proteins: "Protéines animales",
    seafood: "Produits de la mer",
    dairy: "Produits laitiers",
    plant_based: "Produits végétaux",
    fats: "Matières grasses",
    sweet_products: "Produits sucrés",
    beverages: "Boissons",
    condiments: "Condiments et épices",
    supplements: "Compléments",
    other: "Autres"
};

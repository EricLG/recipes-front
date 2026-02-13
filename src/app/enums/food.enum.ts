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

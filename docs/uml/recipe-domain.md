# Recipe Domain Model

This document describes the Recipe domain.
The Recipe domain depends on the Food domain.

## MongoDB Collections
- recipes
- recipeFoods
- RecipeSubRecipe

## Rules
- Recipes never store nutritional values
- RecipeFood is a pivot collection between Recipe and Food
- RecipeSubRecipe allows a recipe to reference another recipe
- Sub-recipes are full recipes with their own ingredients and instructions
- Recipe domain depends on Food domain
- Food domain must never depend on Recipe domain
- Cycles between recipes must be prevented (no recursive loops)

```mermaid
classDiagram
    class Recipe {
        ObjectId _id
        string name
        string instructions
        boolean vegetarian
        RecipeSeason season
        RecipeCategory category
        number servings
    }

    class RecipeFood {
        ObjectId _id
        ObjectId recipeId
        ObjectId foodId
        ObjectId measureId
        number quantity
    }

    class RecipeSubRecipe {
        ObjectId _id
        ObjectId parentRecipeId
        ObjectId childRecipeId
        number quantity
    }

    Recipe "1" --> "many" RecipeFood : contains foods
    Recipe "1" --> "many" RecipeSubRecipe : contains sub-recipes
    RecipeSubRecipe --> Recipe : references

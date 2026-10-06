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
- Personal weekly plans have a unique userId/weekStart (Monday string), targetServings (default 24), totalServings, shortage, surplus and items.
- Plan items snapshot recipeId, recipeName, servings, source and cookedAt; no duplicates or preparation days.
- Completion preserves choices; random/replacement candidates are approved seasonal MAIN or OTHERS recipes not cooked in S−1/S−2. Manual additions accept any approved recipe.
- Current/next weeks editable, past weeks read-only; cooking only editable in current week.
- Shopping lists belong to user/week and snapshot exactly two stores and items of kind ingredient/free. Both kinds have itemKey, foodName, store, checked and inStock; only ingredients require foodId, category, quantity and unit.
- User.shoppingStores provides defaults for new lists. See ../shopping-lists-frontend.md and backend docs/api/weekly-recipe-plans.md.

```mermaid
classDiagram
    class Recipe {
        ObjectId _id
        string name
        string instructions
        boolean vegetarian
        RecipeSeason[] season
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

Completion targets equal recipe counts of VEGETARIAN versus NON_VEGETARIAN/FLEXIBLE,
including existing manual choices using current recipe statuses. Prefer the minority
group, randomly break ties, and fall back if a group is exhausted. Stop at the serving
target; preserve existing choices. Missing/unknown statuses do not count in the ratio.
Replacement does not enforce the ratio; no snapshot or API shape change.

# Food Domain Model

This document describes the Food domain.
The Food domain is independent and describes atomic food products.

## MongoDB Collections
- foods
- measures

## Rules
- Nutritional values are always normalized per 100g or 100ml
- Nutrients is an embedded object, not a collection
- Measures convert human units (slice, piece, spoon) into grams
- Food domain must NOT depend on Recipe domain

```mermaid
classDiagram
    class Food {
        ObjectId _id
        string name
        FoodCategory category
        string referenceUnit
        number density
        Nutrients nutrientsPer100
        boolean needReview
        string source
    }

    class Nutrients {
        number energyKcal
        number proteins
        number fats
        number carbohydrates
        number sugars
        number fibers
        number salt
    }

    class Measure {
        ObjectId _id
        ObjectId foodId
        string label
        number grams
        boolean isDefault
    }

    Food "1" *-- "1" Nutrients
    Food "1" --> "many" Measure : defines

/**
 * Shopping List Generator
 * Generates organized shopping lists for UK supermarkets (Aldi/Asda)
 * Categories: Fresh Produce, Meat & Fish, Dairy & Eggs, Pantry, Frozen
 */

const ShoppingListGenerator = {
    // UK Supermarket Categories
    CATEGORIES: {
        'Meat & Fish': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'cod', 'haddock', 'tuna', 'prawns', 'mince', 'sausage', 'chop', 'thigh', 'breast', 'fillet'],
        'Fresh Produce': ['onion', 'garlic', 'carrot', 'potato', 'tomato', 'pepper', 'lettuce', 'broccoli', 'celery', 'apple', 'lemon', 'vegetable', 'salad', 'herbs', 'parsley', 'dill'],
        'Dairy & Eggs': ['milk', 'butter', 'cheese', 'egg', 'cream', 'crème fraîche', 'sour cream', 'yogurt'],
        'Pantry': ['pasta', 'rice', 'flour', 'oil', 'stock', 'sauce', 'seasoning', 'herbs', 'spices', 'salt', 'pepper', 'vinegar', 'honey', 'chutney', 'ketchup', 'breadcrumbs', 'tin', 'tomato purée', 'beans', 'chickpeas', 'coconut milk', 'soy sauce', 'worcestershire'],
        'Bakery': ['bread', 'tortilla', 'naan', 'taco shells'],
        'Frozen': ['frozen', 'peas', 'sweetcorn', 'stir-fry'],
        'Other': []
    },

    /**
     * Generate shopping list for a specific week
     */
    generate(mealPlan, weekNumber, recipes) {
        if (!mealPlan || !mealPlan.weeks || !mealPlan.weeks[weekNumber - 1]) {
            return null;
        }

        const week = mealPlan.weeks[weekNumber - 1];
        const ingredientMap = new Map(); // Track ingredients with portions needed

        // Collect all ingredients from lunches (batch cooking format)
        if (week.lunches && Array.isArray(week.lunches)) {
            week.lunches.forEach(item => {
                if (item.recipe && item.recipe.ingredients) {
                    const multiplier = item.portions / (item.recipe.servings || 4);
                    item.recipe.ingredients.forEach(ingredient => {
                        // For now, just collect unique ingredients
                        // (Future enhancement: scale quantities by multiplier)
                        if (!ingredientMap.has(ingredient)) {
                            ingredientMap.set(ingredient, true);
                        }
                    });
                }
            });
        }

        // Collect all ingredients from dinners (batch cooking format)
        if (week.dinners && Array.isArray(week.dinners)) {
            week.dinners.forEach(item => {
                if (item.recipe && item.recipe.ingredients) {
                    const multiplier = item.portions / (item.recipe.servings || 4);
                    item.recipe.ingredients.forEach(ingredient => {
                        if (!ingredientMap.has(ingredient)) {
                            ingredientMap.set(ingredient, true);
                        }
                    });
                }
            });
        }

        // Convert map to array
        const allIngredients = Array.from(ingredientMap.keys());

        // Organize into categories
        const categorizedList = this.categorizeIngredients(allIngredients);

        return {
            weekNumber,
            categories: categorizedList
        };
    },

    /**
     * Categorize ingredients into supermarket sections
     */
    categorizeIngredients(ingredients) {
        const categorized = {};

        // Initialize categories
        Object.keys(this.CATEGORIES).forEach(category => {
            categorized[category] = [];
        });

        // Categorize each ingredient
        ingredients.forEach(ingredient => {
            const category = this.detectCategory(ingredient);
            categorized[category].push(ingredient);
        });

        // Remove empty categories
        Object.keys(categorized).forEach(category => {
            if (categorized[category].length === 0) {
                delete categorized[category];
            }
        });

        return categorized;
    },

    /**
     * Detect which category an ingredient belongs to
     */
    detectCategory(ingredient) {
        const lowerIngredient = ingredient.toLowerCase();

        for (const [category, keywords] of Object.entries(this.CATEGORIES)) {
            for (const keyword of keywords) {
                if (lowerIngredient.includes(keyword)) {
                    return category;
                }
            }
        }

        return 'Other';
    },

    /**
     * Get display order for categories (common items first)
     */
    getCategoryOrder() {
        return [
            'Fresh Produce',
            'Meat & Fish',
            'Dairy & Eggs',
            'Bakery',
            'Pantry',
            'Frozen',
            'Other'
        ];
    }
};

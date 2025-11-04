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
        const recipeIds = new Set();

        // Collect all unique recipe IDs from the week (excluding leftovers)
        week.days.forEach(day => {
            day.meals.forEach(meal => {
                if (meal.recipeId) {
                    recipeIds.add(meal.recipeId);
                }
                // Also include recipes that leftovers come from
                if (meal.fromRecipeId) {
                    recipeIds.add(meal.fromRecipeId);
                }
            });
        });

        // Get all ingredients from these recipes
        const allIngredients = [];
        recipeIds.forEach(recipeId => {
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe && recipe.ingredients) {
                recipe.ingredients.forEach(ingredient => {
                    allIngredients.push(ingredient);
                });
            }
        });

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

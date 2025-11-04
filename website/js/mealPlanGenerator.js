/**
 * Meal Plan Generator
 * Generates a 4-week meal plan following family rules:
 * - Sunday: Batch cooking day (2-3 large recipes)
 * - Lunches: Primarily leftovers from previous dinner
 * - Mid-week: Mix of quick-prep and freezer meals
 * - Variety: No same protein two days in row, 1+ fish per week
 * - Friday: Often flexible/leftovers
 */

const MealPlanGenerator = {
    // Days of the week
    DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

    /**
     * Generate complete 4-week meal plan
     */
    generate(recipes) {
        const plan = {
            weeks: []
        };

        // Generate each week
        for (let weekNum = 1; weekNum <= 4; weekNum++) {
            const week = this.generateWeek(recipes, weekNum);
            plan.weeks.push(week);
        }

        return plan;
    },

    /**
     * Generate a single week's meal plan
     */
    generateWeek(recipes, weekNumber) {
        const week = {
            weekNumber,
            days: []
        };

        let previousDinnerProtein = null;
        let previousDinnerRecipe = null;
        let fishCount = 0;

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dayName = this.DAYS[dayIndex];
            const day = {
                name: dayName,
                meals: []
            };

            // Sunday is batch cooking day
            if (dayName === 'Sunday') {
                day.special = 'Batch Day';

                // Lunch: Light meal or leftovers
                day.meals.push({
                    type: 'Lunch',
                    name: 'Leftovers',
                    isLeftover: true
                });

                // Dinner: Big batch cooking recipe
                const sundayRecipe = this.selectRecipe(recipes, {
                    tags: ['batch-cooking', 'sunday-special'],
                    excludeProtein: previousDinnerProtein,
                    preferFish: fishCount === 0 && dayIndex > 4 // Ensure fish if haven't had any
                });

                if (sundayRecipe) {
                    day.meals.push({
                        type: 'Dinner',
                        recipeId: sundayRecipe.id,
                        name: sundayRecipe.name,
                        protein: sundayRecipe.protein
                    });
                    previousDinnerProtein = sundayRecipe.protein;
                    previousDinnerRecipe = sundayRecipe;
                    if (sundayRecipe.protein === 'fish') fishCount++;
                }
            }
            // Monday typically uses Sunday leftovers
            else if (dayName === 'Monday') {
                // Lunch: Leftovers from weekend
                day.meals.push({
                    type: 'Lunch',
                    name: 'Leftovers',
                    isLeftover: true
                });

                // Dinner: Can be leftover from Sunday batch or quick meal
                if (previousDinnerRecipe && Math.random() > 0.3) {
                    // 70% chance to use Sunday leftovers
                    day.meals.push({
                        type: 'Dinner',
                        name: `${previousDinnerRecipe.name} (from Sunday)`,
                        isLeftover: true,
                        fromRecipeId: previousDinnerRecipe.id,
                        protein: previousDinnerRecipe.protein
                    });
                } else {
                    // Quick meal
                    const recipe = this.selectRecipe(recipes, {
                        tags: ['quick-prep', 'weeknight'],
                        excludeProtein: previousDinnerProtein,
                        preferFish: fishCount === 0 && dayIndex > 3
                    });

                    if (recipe) {
                        day.meals.push({
                            type: 'Dinner',
                            recipeId: recipe.id,
                            name: recipe.name,
                            protein: recipe.protein
                        });
                        previousDinnerProtein = recipe.protein;
                        previousDinnerRecipe = recipe;
                        if (recipe.protein === 'fish') fishCount++;
                    }
                }
            }
            // Friday is flexible
            else if (dayName === 'Friday') {
                day.special = 'Flexible';

                // Lunch: Leftovers
                day.meals.push({
                    type: 'Lunch',
                    name: 'Leftovers',
                    isLeftover: true
                });

                // Dinner: Often leftovers or quick meal
                if (Math.random() > 0.5) {
                    day.meals.push({
                        type: 'Dinner',
                        name: 'Flexible / Leftovers',
                        isLeftover: true
                    });
                } else {
                    const recipe = this.selectRecipe(recipes, {
                        tags: ['quick-prep', 'weeknight'],
                        excludeProtein: previousDinnerProtein,
                        preferFish: fishCount === 0
                    });

                    if (recipe) {
                        day.meals.push({
                            type: 'Dinner',
                            recipeId: recipe.id,
                            name: recipe.name,
                            protein: recipe.protein
                        });
                        previousDinnerProtein = recipe.protein;
                        previousDinnerRecipe = recipe;
                        if (recipe.protein === 'fish') fishCount++;
                    }
                }
            }
            // Regular weekdays (Tue-Thu, Sat)
            else {
                // Lunch: Leftovers from previous dinner
                if (previousDinnerRecipe && !previousDinnerRecipe.isLeftover) {
                    day.meals.push({
                        type: 'Lunch',
                        name: `${previousDinnerRecipe.name} (Leftovers)`,
                        isLeftover: true,
                        fromRecipeId: previousDinnerRecipe.id
                    });
                } else {
                    day.meals.push({
                        type: 'Lunch',
                        name: 'Leftovers',
                        isLeftover: true
                    });
                }

                // Dinner: Mix of quick meals and batch-cooked freezer meals
                let recipeOptions = {};

                // Mid-week: prefer quick or freezer-friendly meals
                if (['Tuesday', 'Wednesday', 'Thursday'].includes(dayName)) {
                    recipeOptions = {
                        tags: Math.random() > 0.5 ?
                            ['quick-prep', 'weeknight'] :
                            ['freezer-friendly'],
                        excludeProtein: previousDinnerProtein,
                        preferFish: fishCount === 0 && dayIndex > 2
                    };
                }
                // Saturday: can be anything
                else {
                    recipeOptions = {
                        excludeProtein: previousDinnerProtein,
                        preferFish: fishCount === 0
                    };
                }

                const recipe = this.selectRecipe(recipes, recipeOptions);

                if (recipe) {
                    day.meals.push({
                        type: 'Dinner',
                        recipeId: recipe.id,
                        name: recipe.name,
                        protein: recipe.protein
                    });
                    previousDinnerProtein = recipe.protein;
                    previousDinnerRecipe = recipe;
                    if (recipe.protein === 'fish') fishCount++;
                }
            }

            week.days.push(day);
        }

        return week;
    },

    /**
     * Select a recipe based on criteria
     */
    selectRecipe(recipes, options = {}) {
        const {
            tags = [],
            excludeProtein = null,
            preferFish = false
        } = options;

        // Filter recipes based on criteria
        let candidates = recipes.filter(recipe => {
            // Exclude same protein as previous meal
            if (excludeProtein && recipe.protein === excludeProtein) {
                return false;
            }

            // If specific tags required, recipe must have at least one
            if (tags.length > 0) {
                const hasMatchingTag = tags.some(tag =>
                    recipe.tags && recipe.tags.includes(tag)
                );
                if (!hasMatchingTag) {
                    return false;
                }
            }

            return true;
        });

        // If no candidates found, try without tag requirements
        if (candidates.length === 0 && tags.length > 0) {
            candidates = recipes.filter(recipe =>
                !excludeProtein || recipe.protein !== excludeProtein
            );
        }

        // If prefer fish, try to get fish first
        if (preferFish) {
            const fishRecipes = candidates.filter(r => r.protein === 'fish');
            if (fishRecipes.length > 0) {
                return this.getRandomElement(fishRecipes);
            }
        }

        // Return random candidate
        return candidates.length > 0 ? this.getRandomElement(candidates) : null;
    },

    /**
     * Get random element from array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

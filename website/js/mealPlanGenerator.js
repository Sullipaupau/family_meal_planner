/**
 * Meal Plan Generator - Batch Cooking Edition
 * Generates realistic batch cooking meal plans:
 * - 1 lunch recipe for the whole week
 * - 2-4 dinner recipes covering different days
 * - Portion-based planning
 * - Total cooking time calculation
 */

const MealPlanGenerator = {
    DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    WEEKDAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    WEEKEND: ['Saturday', 'Sunday'],

    /**
     * Generate complete meal plan (1-4 weeks)
     */
    generate(recipes) {
        const config = App.config || {
            lunchPortions: 10,
            dinnerRecipes: 3,
            weekendFamilyMeals: true,
            childSeparateWeekdays: true,
            numberOfWeeks: 1
        };

        const plan = {
            weeks: [],
            config: config
        };

        // Generate each week based on config
        const numWeeks = config.numberOfWeeks || 1;
        for (let weekNum = 1; weekNum <= numWeeks; weekNum++) {
            const week = this.generateWeek(recipes, weekNum, config);
            plan.weeks.push(week);
        }

        return plan;
    },

    /**
     * Generate a single week's batch cooking plan
     */
    generateWeek(recipes, weekNumber, config) {
        const week = {
            weekNumber,
            lunches: [],
            dinners: [],
            totalCookingTime: { prep: 0, cook: 0 }
        };

        // Generate lunch plan (1 recipe for the whole week)
        const lunchRecipe = this.selectRecipe(recipes, {
            tags: ['batch-cooking', 'freezer-friendly'],
            preferProtein: null
        });

        if (lunchRecipe) {
            week.lunches.push({
                recipe: lunchRecipe,
                portions: config.lunchPortions || 10,
                days: this.WEEKDAYS,
                prepTime: this.parseTime(lunchRecipe.prepTime),
                cookTime: this.parseTime(lunchRecipe.cookTime)
            });

            week.totalCookingTime.prep += this.parseTime(lunchRecipe.prepTime);
            week.totalCookingTime.cook += this.parseTime(lunchRecipe.cookTime);
        }

        // Generate dinner plan (2-4 recipes covering the week)
        const numDinnerRecipes = config.dinnerRecipes || 3;
        const availableDays = [...this.DAYS];
        let usedProteins = lunchRecipe ? [lunchRecipe.protein] : [];

        for (let i = 0; i < numDinnerRecipes; i++) {
            if (availableDays.length === 0) break;

            // Decide how many days this recipe will cover
            const remainingRecipes = numDinnerRecipes - i;
            const remainingDays = availableDays.length;
            const daysForThisRecipe = Math.ceil(remainingDays / remainingRecipes);

            // Select days for this recipe
            const recipeDays = [];
            for (let d = 0; d < daysForThisRecipe && availableDays.length > 0; d++) {
                recipeDays.push(availableDays.shift());
            }

            // Determine if this is a family meal
            const isFamilyMeal = config.weekendFamilyMeals &&
                recipeDays.some(day => this.WEEKEND.includes(day));

            // Select appropriate recipe
            const dinnerRecipe = this.selectRecipe(recipes, {
                tags: isFamilyMeal ? ['sunday-special', 'family-favorite'] : ['batch-cooking', 'weeknight'],
                excludeProteins: usedProteins,
                preferProtein: i === 0 ? 'fish' : null // Try to get fish in first dinner
            });

            if (dinnerRecipe) {
                const portions = recipeDays.length * (App.config.adults + App.config.children);

                week.dinners.push({
                    recipe: dinnerRecipe,
                    portions: portions,
                    days: recipeDays,
                    isFamilyMeal: isFamilyMeal,
                    prepTime: this.parseTime(dinnerRecipe.prepTime),
                    cookTime: this.parseTime(dinnerRecipe.cookTime)
                });

                week.totalCookingTime.prep += this.parseTime(dinnerRecipe.prepTime);
                week.totalCookingTime.cook += this.parseTime(dinnerRecipe.cookTime);

                usedProteins.push(dinnerRecipe.protein);
            }
        }

        // Calculate total time in hours and minutes
        week.totalCookingTime.total = week.totalCookingTime.prep + week.totalCookingTime.cook;
        week.totalCookingTime.formatted = this.formatCookingTime(week.totalCookingTime.total);

        return week;
    },

    /**
     * Select a recipe based on criteria
     */
    selectRecipe(recipes, options = {}) {
        const {
            tags = [],
            excludeProteins = [],
            preferProtein = null
        } = options;

        // Filter recipes
        let candidates = recipes.filter(recipe => {
            // Exclude used proteins
            if (excludeProteins.includes(recipe.protein)) {
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

        // If no candidates, try without tag requirements
        if (candidates.length === 0 && tags.length > 0) {
            candidates = recipes.filter(recipe =>
                !excludeProteins.includes(recipe.protein)
            );
        }

        // If prefer specific protein, try that first
        if (preferProtein) {
            const preferred = candidates.filter(r => r.protein === preferProtein);
            if (preferred.length > 0) {
                return this.getRandomElement(preferred);
            }
        }

        // Return random candidate
        return candidates.length > 0 ? this.getRandomElement(candidates) : null;
    },

    /**
     * Parse time string to minutes
     */
    parseTime(timeStr) {
        if (!timeStr) return 0;

        const match = timeStr.match(/(\d+)\s*(hour|minute|min|hr)/i);
        if (!match) return 0;

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit.startsWith('hour') || unit.startsWith('hr')) {
            return value * 60;
        }
        return value;
    },

    /**
     * Format cooking time for display
     */
    formatCookingTime(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${mins}min`;
    },

    /**
     * Get random element from array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

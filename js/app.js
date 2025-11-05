/**
 * Meal Plan Automator - Main Application
 * Handles initialization, state management, and data loading
 */

// Global application state
const App = {
    recipes: [],
    currentMealPlan: null,
    currentWeek: 1,
    config: {
        adults: 2,
        children: 1,
        lunchPortions: 10,
        dinnerRecipes: 3,
        weekendFamilyMeals: true,
        childSeparateWeekdays: true,
        numberOfWeeks: 1
    },

    /**
     * Initialize the application
     */
    async init() {
        // Load config from localStorage
        this.loadConfig();

        try {
            // Load recipes from JSON
            await this.loadRecipes();

            // Try to load saved meal plan from localStorage
            this.loadSavedPlan();

            // Initialize UI
            UI.init();

            // If no saved plan, show empty state
            if (!this.currentMealPlan) {
                UI.showEmptyState();
            } else {
                UI.renderMealPlan(this.currentMealPlan);
            }

        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to load the application. Please refresh the page.');
        }
    },

    /**
     * Load recipes from JSON file
     */
    async loadRecipes() {
        try {
            const response = await fetch('data/recipes.json');
            if (!response.ok) {
                throw new Error('Failed to load recipes');
            }
            const data = await response.json();
            this.recipes = data.recipes;
            console.log(`Loaded ${this.recipes.length} recipes`);
        } catch (error) {
            console.error('Error loading recipes:', error);
            throw error;
        }
    },

    /**
     * Generate a new meal plan
     */
    generateNewPlan() {
        UI.showLoading();

        // Small delay to show loading animation
        setTimeout(() => {
            try {
                console.log('Generating meal plan with config:', this.config);
                this.currentMealPlan = MealPlanGenerator.generate(this.recipes);
                console.log('Generated meal plan:', this.currentMealPlan);
                this.savePlan();
                UI.hideLoading();
                UI.hideEmptyState();
                UI.renderMealPlan(this.currentMealPlan);
            } catch (error) {
                console.error('Error generating meal plan:', error);
                console.error('Error stack:', error.stack);
                UI.hideLoading();
                alert('Failed to generate meal plan. Please try again.\n\nError: ' + error.message);
            }
        }, 500);
    },

    /**
     * Save current meal plan to localStorage
     */
    savePlan() {
        try {
            localStorage.setItem('mealPlan', JSON.stringify(this.currentMealPlan));
            localStorage.setItem('mealPlanDate', new Date().toISOString());
        } catch (error) {
            console.error('Error saving meal plan:', error);
        }
    },

    /**
     * Load saved meal plan from localStorage
     */
    loadSavedPlan() {
        try {
            const savedPlan = localStorage.getItem('mealPlan');
            if (savedPlan) {
                const plan = JSON.parse(savedPlan);

                // Validate plan structure (check if it's the new batch format)
                if (plan && plan.weeks && Array.isArray(plan.weeks) && plan.weeks.length > 0) {
                    const firstWeek = plan.weeks[0];
                    // Check if it's the new format (has lunches/dinners arrays)
                    if (firstWeek.lunches && firstWeek.dinners) {
                        this.currentMealPlan = plan;
                        console.log('Loaded saved meal plan (batch format)');
                    } else {
                        console.log('Old meal plan format detected, clearing');
                        localStorage.removeItem('mealPlan');
                    }
                } else {
                    console.log('Invalid meal plan structure, clearing');
                    localStorage.removeItem('mealPlan');
                }
            }
        } catch (error) {
            console.error('Error loading saved meal plan:', error);
            localStorage.removeItem('mealPlan');
        }
    },

    /**
     * Get recipe by ID
     */
    getRecipeById(recipeId) {
        return this.recipes.find(recipe => recipe.id === recipeId);
    },

    /**
     * Switch to a different week
     */
    switchWeek(weekNumber) {
        this.currentWeek = weekNumber;
        UI.switchWeek(weekNumber);
    },

    /**
     * Save config to localStorage
     */
    saveConfig() {
        try {
            localStorage.setItem('mealPlanConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('Error saving config:', error);
        }
    },

    /**
     * Load config from localStorage
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('mealPlanConfig');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
                console.log('Loaded config:', this.config);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    },

    /**
     * Update config
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.saveConfig();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

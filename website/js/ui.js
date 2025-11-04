/**
 * UI Controller
 * Handles all user interface interactions and rendering
 */

const UI = {
    // DOM Elements
    elements: {
        generatePlanBtn: null,
        showShoppingListBtn: null,
        weekTabs: null,
        weekViews: null,
        emptyState: null,
        recipeModal: null,
        shoppingListModal: null,
        loadingOverlay: null
    },

    /**
     * Initialize UI event listeners
     */
    init() {
        // Cache DOM elements
        this.elements.generatePlanBtn = document.getElementById('generatePlanBtn');
        this.elements.showShoppingListBtn = document.getElementById('showShoppingListBtn');
        this.elements.weekTabs = document.querySelectorAll('.week-tab');
        this.elements.weekViews = document.querySelectorAll('.week-view');
        this.elements.emptyState = document.getElementById('emptyState');
        this.elements.recipeModal = document.getElementById('recipeModal');
        this.elements.shoppingListModal = document.getElementById('shoppingListModal');
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');

        // Event listeners
        this.elements.generatePlanBtn.addEventListener('click', () => {
            App.generateNewPlan();
        });

        this.elements.showShoppingListBtn.addEventListener('click', () => {
            this.showShoppingListModal();
        });

        // Week tab switching
        this.elements.weekTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const weekNumber = parseInt(e.target.dataset.week);
                App.switchWeek(weekNumber);
            });
        });

        // Modal close buttons
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        modalCloseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Close modal on background click
        [this.elements.recipeModal, this.elements.shoppingListModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Shopping list generation
        const generateShoppingBtn = document.getElementById('generateShoppingListBtn');
        if (generateShoppingBtn) {
            generateShoppingBtn.addEventListener('click', () => {
                this.generateShoppingList();
            });
        }
    },

    /**
     * Render the complete meal plan
     */
    renderMealPlan(mealPlan) {
        if (!mealPlan || !mealPlan.weeks) {
            this.showEmptyState();
            return;
        }

        // Render each week
        mealPlan.weeks.forEach((week, index) => {
            const weekView = document.querySelector(`.week-view[data-week="${week.weekNumber}"]`);
            if (weekView) {
                const daysContainer = weekView.querySelector('.days-container');
                daysContainer.innerHTML = '';

                // Render each day
                week.days.forEach(day => {
                    const dayCard = this.createDayCard(day);
                    daysContainer.appendChild(dayCard);
                });
            }
        });
    },

    /**
     * Create a day card element
     */
    createDayCard(day) {
        const card = document.createElement('div');
        card.className = 'day-card';

        // Day header
        const header = document.createElement('div');
        header.className = 'day-header';

        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = day.name;
        header.appendChild(dayName);

        // Special day badge (e.g., "Batch Day", "Flexible")
        if (day.special) {
            const specialBadge = document.createElement('span');
            specialBadge.className = 'day-special';
            specialBadge.textContent = day.special;
            header.appendChild(specialBadge);
        }

        card.appendChild(header);

        // Meals list
        const mealsList = document.createElement('div');
        mealsList.className = 'meals-list';

        day.meals.forEach(meal => {
            const mealItem = this.createMealItem(meal);
            mealsList.appendChild(mealItem);
        });

        card.appendChild(mealsList);

        return card;
    },

    /**
     * Create a meal item element
     */
    createMealItem(meal) {
        const item = document.createElement('div');
        item.className = 'meal-item';

        // Meal type label
        const label = document.createElement('div');
        label.className = 'meal-label';
        label.textContent = meal.type;

        // Meal name
        const name = document.createElement('div');
        name.className = 'meal-name';
        if (meal.isLeftover) {
            name.classList.add('leftover');
        }
        name.textContent = meal.name;

        // Meal icon
        const icon = document.createElement('div');
        icon.className = 'meal-icon';
        icon.textContent = this.getMealIcon(meal);

        item.appendChild(label);
        item.appendChild(name);
        item.appendChild(icon);

        // Click handler for recipe details (not for leftovers without recipe ID)
        if (meal.recipeId) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                this.showRecipeModal(meal.recipeId);
            });
        } else if (meal.fromRecipeId) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                this.showRecipeModal(meal.fromRecipeId);
            });
        }

        return item;
    },

    /**
     * Get appropriate icon for meal
     */
    getMealIcon(meal) {
        if (meal.isLeftover) {
            return '♻️';
        }

        // Icon based on protein type
        const iconMap = {
            'chicken': '🐔',
            'beef': '🐄',
            'pork': '🐷',
            'lamb': '🐑',
            'fish': '🐟'
        };

        return meal.protein ? iconMap[meal.protein] || '🍽️' : '🍽️';
    },

    /**
     * Show recipe details modal
     */
    showRecipeModal(recipeId) {
        const recipe = App.getRecipeById(recipeId);
        if (!recipe) {
            console.error('Recipe not found:', recipeId);
            return;
        }

        // Populate modal content
        document.getElementById('modalRecipeName').textContent = recipe.name;
        document.getElementById('modalCookingTime').textContent = recipe.cookingTime;
        document.getElementById('modalServings').textContent = recipe.servings;
        document.getElementById('modalDifficulty').textContent = recipe.difficulty;

        // Ava-friendly section
        if (recipe.avaFriendly) {
            document.getElementById('modalAvaFriendly').textContent = recipe.avaFriendly;
            document.getElementById('avaFriendlySection').style.display = 'block';
        } else {
            document.getElementById('avaFriendlySection').style.display = 'none';
        }

        // Ingredients
        const ingredientsList = document.getElementById('modalIngredients');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });

        // Instructions
        const instructionsList = document.getElementById('modalInstructions');
        instructionsList.innerHTML = '';
        recipe.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            instructionsList.appendChild(li);
        });

        // Adults variation
        if (recipe.adultsVariation) {
            document.getElementById('modalAdultsVariation').textContent = recipe.adultsVariation;
            document.getElementById('adultsVariationSection').style.display = 'block';
        } else {
            document.getElementById('adultsVariationSection').style.display = 'none';
        }

        // Storage notes
        if (recipe.storageNotes) {
            document.getElementById('modalStorageNotes').textContent = recipe.storageNotes;
            document.getElementById('storageNotesSection').style.display = 'block';
        } else {
            document.getElementById('storageNotesSection').style.display = 'none';
        }

        // Show modal
        this.openModal(this.elements.recipeModal);
    },

    /**
     * Show shopping list modal
     */
    showShoppingListModal() {
        if (!App.currentMealPlan) {
            alert('Please generate a meal plan first!');
            return;
        }

        // Set default week to current week
        const weekSelect = document.getElementById('shoppingWeekSelect');
        weekSelect.value = App.currentWeek.toString();

        // Open modal
        this.openModal(this.elements.shoppingListModal);

        // Generate list for current week
        this.generateShoppingList();
    },

    /**
     * Generate shopping list for selected week
     */
    generateShoppingList() {
        const weekSelect = document.getElementById('shoppingWeekSelect');
        const weekNumber = parseInt(weekSelect.value);
        const content = document.getElementById('shoppingListContent');

        // Generate shopping list
        const shoppingList = ShoppingListGenerator.generate(
            App.currentMealPlan,
            weekNumber,
            App.recipes
        );

        if (!shoppingList || !shoppingList.categories) {
            content.innerHTML = '<div class="shopping-empty">No items found for this week.</div>';
            return;
        }

        // Render shopping list by category
        content.innerHTML = '';

        const categoryOrder = ShoppingListGenerator.getCategoryOrder();
        categoryOrder.forEach(categoryName => {
            if (shoppingList.categories[categoryName] && shoppingList.categories[categoryName].length > 0) {
                const categoryElement = this.createCategoryElement(
                    categoryName,
                    shoppingList.categories[categoryName]
                );
                content.appendChild(categoryElement);
            }
        });
    },

    /**
     * Create a category element for shopping list
     */
    createCategoryElement(categoryName, items) {
        const category = document.createElement('div');
        category.className = 'shopping-category';

        // Category header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.textContent = categoryName;
        category.appendChild(header);

        // Category items
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'category-items';

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shopping-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'shopping-checkbox';

            const text = document.createElement('span');
            text.className = 'shopping-item-text';
            text.textContent = item;

            // Toggle checked state
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    text.classList.add('checked');
                } else {
                    text.classList.remove('checked');
                }
            });

            itemElement.appendChild(checkbox);
            itemElement.appendChild(text);
            itemsContainer.appendChild(itemElement);
        });

        category.appendChild(itemsContainer);
        return category;
    },

    /**
     * Open a modal
     */
    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    /**
     * Close a modal
     */
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    },

    /**
     * Switch between weeks
     */
    switchWeek(weekNumber) {
        // Update week tabs
        this.elements.weekTabs.forEach(tab => {
            if (parseInt(tab.dataset.week) === weekNumber) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update week views
        this.elements.weekViews.forEach(view => {
            if (parseInt(view.dataset.week) === weekNumber) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
    },

    /**
     * Show empty state
     */
    showEmptyState() {
        this.elements.emptyState.classList.add('active');
        document.getElementById('mealPlanContainer').style.display = 'none';
    },

    /**
     * Hide empty state
     */
    hideEmptyState() {
        this.elements.emptyState.classList.remove('active');
        document.getElementById('mealPlanContainer').style.display = 'block';
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        this.elements.loadingOverlay.classList.add('active');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.remove('active');
    }
};

/**
 * UI Controller
 * Handles all user interface interactions and rendering
 */

const UI = {
    // DOM Elements
    elements: {
        generatePlanBtn: null,
        browseRecipesBtn: null,
        showShoppingListBtn: null,
        showConfigBtn: null,
        weekTabs: null,
        weekViews: null,
        emptyState: null,
        recipeModal: null,
        recipeBrowserModal: null,
        shoppingListModal: null,
        configModal: null,
        editBatchDaysModal: null,
        loadingOverlay: null
    },

    // State for recipe changing
    changingMeal: null, // { weekNumber, dayIndex, mealIndex }

    // State for editing batch days
    editingBatch: null, // { weekNumber, mealType, item }

    /**
     * Initialize UI event listeners
     */
    init() {
        // Cache DOM elements
        this.elements.generatePlanBtn = document.getElementById('generatePlanBtn');
        this.elements.browseRecipesBtn = document.getElementById('browseRecipesBtn');
        this.elements.showShoppingListBtn = document.getElementById('showShoppingListBtn');
        this.elements.showConfigBtn = document.getElementById('showConfigBtn');
        this.elements.weekTabs = document.querySelectorAll('.week-tab');
        this.elements.weekViews = document.querySelectorAll('.week-view');
        this.elements.emptyState = document.getElementById('emptyState');
        this.elements.recipeModal = document.getElementById('recipeModal');
        this.elements.recipeBrowserModal = document.getElementById('recipeBrowserModal');
        this.elements.shoppingListModal = document.getElementById('shoppingListModal');
        this.elements.configModal = document.getElementById('configModal');
        this.elements.editBatchDaysModal = document.getElementById('editBatchDaysModal');
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');

        // Event listeners
        this.elements.generatePlanBtn.addEventListener('click', () => {
            App.generateNewPlan();
        });

        this.elements.browseRecipesBtn.addEventListener('click', () => {
            this.showRecipeBrowserModal();
        });

        this.elements.showShoppingListBtn.addEventListener('click', () => {
            this.showShoppingListModal();
        });

        this.elements.showConfigBtn.addEventListener('click', () => {
            this.showConfigModal();
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
        [this.elements.recipeModal, this.elements.recipeBrowserModal, this.elements.shoppingListModal, this.elements.configModal, this.elements.editBatchDaysModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Recipe filter
        const proteinFilter = document.getElementById('proteinFilter');
        if (proteinFilter) {
            proteinFilter.addEventListener('change', () => {
                this.filterRecipes();
            });
        }

        // Shopping list generation
        const generateShoppingBtn = document.getElementById('generateShoppingListBtn');
        if (generateShoppingBtn) {
            generateShoppingBtn.addEventListener('click', () => {
                this.generateShoppingList();
            });
        }

        // Config save button
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                this.saveConfig();
            });
        }

        // Update household summary when inputs change
        const adultsInput = document.getElementById('adultsCount');
        const childrenInput = document.getElementById('childrenCount');
        if (adultsInput && childrenInput) {
            [adultsInput, childrenInput].forEach(input => {
                input.addEventListener('input', () => {
                    this.updateHouseholdSummary();
                });
            });
        }

        // Edit batch days modal buttons
        const saveDaysBtn = document.getElementById('saveDaysBtn');
        if (saveDaysBtn) {
            saveDaysBtn.addEventListener('click', () => {
                this.saveBatchDaysChanges();
            });
        }

        const splitToDailyBtn = document.getElementById('splitToDailyBtn');
        if (splitToDailyBtn) {
            splitToDailyBtn.addEventListener('click', () => {
                this.splitBatchToDaily();
            });
        }

        // Day checkboxes - listen for changes to update portions summary
        const dayCheckboxes = document.querySelectorAll('.day-checkbox');
        dayCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updatePortionsSummary();
            });
        });
    },

    /**
     * Render the complete meal plan (batch cooking format)
     */
    renderMealPlan(mealPlan) {
        if (!mealPlan || !mealPlan.weeks) {
            this.showEmptyState();
            return;
        }

        // Show/hide week tabs based on number of weeks
        const allWeekTabs = document.querySelectorAll('.week-tab');
        const allWeekViews = document.querySelectorAll('.week-view');

        allWeekTabs.forEach((tab, index) => {
            if (index < mealPlan.weeks.length) {
                tab.style.display = '';
            } else {
                tab.style.display = 'none';
            }
        });

        allWeekViews.forEach((view, index) => {
            if (index < mealPlan.weeks.length) {
                view.style.display = '';
            } else {
                view.style.display = 'none';
            }
        });

        // Render each week
        mealPlan.weeks.forEach((week, index) => {
            const weekView = document.querySelector(`.week-view[data-week="${week.weekNumber}"]`);
            if (!weekView) {
                console.warn(`Week view not found for week ${week.weekNumber}`);
                return;
            }

            const container = weekView.querySelector('.days-container');
            if (!container) {
                console.error(`Days container not found for week ${week.weekNumber}`);
                return;
            }

            container.innerHTML = '';
            container.className = 'days-container batch-cooking-container';

            // Render cooking time summary
            const timeSummary = this.createCookingTimeSummary(week);
            container.appendChild(timeSummary);

            // Render lunches section
            const lunchesSection = this.createBatchSection('🥗 Lunches (Mon-Fri)', week.lunches, week.weekNumber);
            container.appendChild(lunchesSection);

            // Render dinners section
            const dinnersSection = this.createBatchSection('🍽️ Dinners', week.dinners, week.weekNumber);
            container.appendChild(dinnersSection);
        });

        // Make sure week 1 is active
        App.switchWeek(1);
    },

    /**
     * Create cooking time summary banner
     */
    createCookingTimeSummary(week) {
        const banner = document.createElement('div');
        banner.className = 'cooking-time-banner';

        const icon = document.createElement('span');
        icon.className = 'time-icon';
        icon.textContent = '⏱️';

        const label = document.createElement('span');
        label.className = 'time-label';
        label.textContent = 'Total Batch Cooking Time:';

        const time = document.createElement('span');
        time.className = 'time-value';
        time.textContent = week.totalCookingTime.formatted;

        const breakdown = document.createElement('span');
        breakdown.className = 'time-breakdown';
        const prepFormatted = MealPlanGenerator.formatCookingTime(week.totalCookingTime.prep);
        const cookFormatted = MealPlanGenerator.formatCookingTime(week.totalCookingTime.cook);
        breakdown.textContent = '(' + prepFormatted + ' prep + ' + cookFormatted + ' cook)';

        banner.appendChild(icon);
        banner.appendChild(label);
        banner.appendChild(time);
        banner.appendChild(breakdown);

        return banner;
    },

    /**
     * Create a batch cooking section
     */
    createBatchSection(title, items, weekNumber) {
        const section = document.createElement('div');
        section.className = 'batch-section';

        const header = document.createElement('h3');
        header.className = 'batch-section-header';
        header.textContent = title;
        section.appendChild(header);

        if (!items || items.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'batch-empty';
            empty.textContent = 'No items planned';
            section.appendChild(empty);
            return section;
        }

        items.forEach(item => {
            const card = this.createBatchRecipeCard(item, weekNumber);
            section.appendChild(card);
        });

        return section;
    },

    /**
     * Create a batch recipe card
     */
    createBatchRecipeCard(item, weekNumber) {
        const card = document.createElement('div');
        card.className = 'batch-recipe-card';

        if (item.isFamilyMeal) {
            card.classList.add('family-meal');
        }

        // Header with recipe name
        const header = document.createElement('div');
        header.className = 'batch-recipe-header';

        const icon = document.createElement('span');
        icon.className = 'batch-recipe-icon';
        const iconMap = {
            'chicken': '🐔',
            'beef': '🐄',
            'pork': '🐷',
            'lamb': '🐑',
            'fish': '🐟'
        };
        icon.textContent = iconMap[item.recipe.protein] || '🍽️';

        const name = document.createElement('span');
        name.className = 'batch-recipe-name';
        name.textContent = item.recipe.name;
        name.style.cursor = 'pointer';
        name.addEventListener('click', () => {
            this.showRecipeModal(item.recipe.id);
        });

        header.appendChild(icon);
        header.appendChild(name);

        if (item.isFamilyMeal) {
            const familyBadge = document.createElement('span');
            familyBadge.className = 'family-badge';
            familyBadge.textContent = '👨‍👩‍👧 Family';
            header.appendChild(familyBadge);
        }

        card.appendChild(header);

        // Details
        const details = document.createElement('div');
        details.className = 'batch-recipe-details';

        // Days
        const days = document.createElement('div');
        days.className = 'batch-detail-item';
        let daysText;
        if (item.days.length === 1) {
            daysText = item.days[0];
        } else if (item.days.length === 7) {
            daysText = 'Mon-Sun';
        } else if (item.days.length === 5 && item.days[0] === 'Monday') {
            daysText = 'Mon-Fri';
        } else {
            daysText = item.days[0] + '-' + item.days[item.days.length - 1];
        }
        days.innerHTML = '<strong>Days:</strong> ' + daysText;

        // Portions with multiplier
        const portions = document.createElement('div');
        portions.className = 'batch-detail-item';

        // Get base servings (handle both string "4-6" and number 6)
        let baseServings = 4; // default
        if (typeof item.recipe.servings === 'number') {
            baseServings = item.recipe.servings;
        } else if (typeof item.recipe.servings === 'string') {
            const servingsMatch = item.recipe.servings.match(/(\d+)/);
            baseServings = servingsMatch ? parseInt(servingsMatch[1]) : 4;
        }

        const multiplier = (item.portions / baseServings).toFixed(1);

        if (multiplier === '1.0') {
            portions.innerHTML = '<strong>Make:</strong> ' + item.portions + ' portions (as per recipe)';
        } else {
            portions.innerHTML = '<strong>Make:</strong> ' + multiplier + 'x the recipe (' + item.portions + ' portions)';
        }


        // Times
        const times = document.createElement('div');
        times.className = 'batch-detail-item';
        const prepTime = MealPlanGenerator.formatCookingTime(item.prepTime);
        const cookTime = MealPlanGenerator.formatCookingTime(item.cookTime);
        times.innerHTML = '<strong>Time:</strong> ' + prepTime + ' prep + ' + cookTime + ' cook';

        details.appendChild(days);
        details.appendChild(portions);
        details.appendChild(times);

        card.appendChild(details);

        // Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'batch-recipe-buttons';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '0.5rem';
        buttonsContainer.style.marginTop = '1rem';

        // Add edit days button
        const editDaysBtn = document.createElement('button');
        editDaysBtn.className = 'btn btn-secondary';
        editDaysBtn.textContent = '✏️ Edit Days';
        editDaysBtn.style.flex = '1';
        editDaysBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isLunch = card.closest('.batch-section').querySelector('.batch-section-header').textContent.includes('Lunch');
            this.openEditDaysModal(weekNumber, isLunch ? 'lunch' : 'dinner', item);
        });
        buttonsContainer.appendChild(editDaysBtn);

        // Add change recipe button
        const changeBtn = document.createElement('button');
        changeBtn.className = 'change-recipe-btn';
        changeBtn.textContent = 'Change Recipe';
        changeBtn.style.flex = '1';
        changeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Figure out if this is lunch or dinner
            const isLunch = card.closest('.batch-section').querySelector('.batch-section-header').textContent.includes('Lunch');
            this.startChangingBatchRecipe(weekNumber, isLunch ? 'lunch' : 'dinner', item);
        });
        buttonsContainer.appendChild(changeBtn);

        card.appendChild(buttonsContainer);

        return card;
    },

    /**
     * Create a day card element
     */
    createDayCard(day, weekNumber, dayIndex) {
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

        day.meals.forEach((meal, mealIndex) => {
            const mealItem = this.createMealItem(meal, weekNumber, dayIndex, mealIndex);
            mealsList.appendChild(mealItem);
        });

        card.appendChild(mealsList);

        return card;
    },

    /**
     * Create a meal item element
     */
    createMealItem(meal, weekNumber, dayIndex, mealIndex) {
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

        // Add change button for non-generic-leftover meals
        const isGenericLeftover = meal.isLeftover && !meal.fromRecipeId && !meal.recipeId;
        if (!isGenericLeftover) {
            const changeBtn = document.createElement('button');
            changeBtn.className = 'meal-change-btn';
            changeBtn.textContent = 'Change';
            changeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startChangingMeal(weekNumber, dayIndex, mealIndex);
            });
            item.appendChild(changeBtn);
        }

        // Click handler for recipe details (not for generic leftovers)
        if (meal.recipeId || meal.fromRecipeId) {
            name.style.cursor = 'pointer';
            icon.style.cursor = 'pointer';

            const showRecipe = () => {
                const recipeId = meal.recipeId || meal.fromRecipeId;
                this.showRecipeModal(recipeId);
            };

            name.addEventListener('click', showRecipe);
            icon.addEventListener('click', showRecipe);
            item.classList.add('clickable');
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
        document.getElementById('modalPrepTime').textContent = recipe.prepTime;
        document.getElementById('modalCookTime').textContent = recipe.cookTime;
        document.getElementById('modalServings').textContent = recipe.servings;
        document.getElementById('modalDifficulty').textContent = recipe.difficulty;

        // Child-friendly section
        if (recipe.childFriendly) {
            document.getElementById('modalChildFriendly').textContent = recipe.childFriendly;
            document.getElementById('childFriendlySection').style.display = 'block';
        } else {
            document.getElementById('childFriendlySection').style.display = 'none';
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

        // Populate week dropdown based on actual number of weeks in meal plan
        const weekSelect = document.getElementById('shoppingWeekSelect');
        weekSelect.innerHTML = ''; // Clear existing options

        const numWeeks = App.currentMealPlan.weeks.length;
        for (let i = 1; i <= numWeeks; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Week ${i}`;
            weekSelect.appendChild(option);
        }

        // Set default week to current week
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
    },

    /**
     * Show recipe browser modal
     */
    showRecipeBrowserModal(forChanging = false) {
        if (!forChanging && !App.recipes.length) {
            alert('No recipes available!');
            return;
        }

        // Show/hide changing mode message
        const changingMessage = document.getElementById('changingModeMessage');
        if (changingMessage) {
            changingMessage.style.display = forChanging ? 'block' : 'none';
        }

        // Render recipe list
        this.renderRecipeList();

        // Open modal
        this.openModal(this.elements.recipeBrowserModal);
    },

    /**
     * Render recipe list
     */
    renderRecipeList(filterProtein = 'all') {
        const container = document.getElementById('recipeListContainer');
        if (!container) return;

        container.innerHTML = '';

        // Filter recipes
        let recipes = App.recipes;
        if (filterProtein !== 'all') {
            recipes = recipes.filter(r => r.protein === filterProtein);
        }

        // Render each recipe card
        recipes.forEach(recipe => {
            const card = this.createRecipeBrowserCard(recipe);
            container.appendChild(card);
        });

        if (recipes.length === 0) {
            container.innerHTML = '<div class="shopping-empty">No recipes found for this filter.</div>';
        }
    },

    /**
     * Create a recipe browser card
     */
    createRecipeBrowserCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-browser-card';

        // Header
        const header = document.createElement('div');
        header.className = 'recipe-browser-header';

        const icon = document.createElement('div');
        icon.className = 'recipe-browser-icon';
        const iconMap = {
            'chicken': '🐔',
            'beef': '🐄',
            'pork': '🐷',
            'lamb': '🐑',
            'fish': '🐟'
        };
        icon.textContent = iconMap[recipe.protein] || '🍽️';

        const name = document.createElement('div');
        name.className = 'recipe-browser-name';
        name.textContent = recipe.name;

        header.appendChild(icon);
        header.appendChild(name);
        card.appendChild(header);

        // Meta info
        const meta = document.createElement('div');
        meta.className = 'recipe-browser-meta';

        const prepTime = document.createElement('div');
        prepTime.className = 'recipe-browser-meta-item';
        prepTime.innerHTML = `🔪 Prep: ${recipe.prepTime}`;

        const cookTime = document.createElement('div');
        cookTime.className = 'recipe-browser-meta-item';
        cookTime.innerHTML = `⏱️ Cook: ${recipe.cookTime}`;

        const servings = document.createElement('div');
        servings.className = 'recipe-browser-meta-item';
        servings.innerHTML = `👥 ${recipe.servings} servings`;

        const difficulty = document.createElement('div');
        difficulty.className = 'recipe-browser-meta-item';
        difficulty.innerHTML = `📊 ${recipe.difficulty}`;

        meta.appendChild(prepTime);
        meta.appendChild(cookTime);
        meta.appendChild(servings);
        meta.appendChild(difficulty);
        card.appendChild(meta);

        // Click handler
        card.addEventListener('click', () => {
            if (this.changingMeal) {
                // User is changing a meal
                this.confirmChangeRecipe(recipe);
            } else {
                // Just viewing recipe details
                this.showRecipeModal(recipe.id);
            }
        });

        return card;
    },

    /**
     * Filter recipes by protein
     */
    filterRecipes() {
        const filterSelect = document.getElementById('proteinFilter');
        const filterValue = filterSelect.value;
        this.renderRecipeList(filterValue);
    },

    /**
     * Start changing a meal
     */
    startChangingMeal(weekNumber, dayIndex, mealIndex) {
        this.changingMeal = { weekNumber, dayIndex, mealIndex };

        // Show recipe browser in "changing mode"
        this.showRecipeBrowserModal(true);
    },

    /**
     * Start changing a batch recipe
     */
    startChangingBatchRecipe(weekNumber, mealType, item) {
        console.log('Starting to change batch recipe:', { weekNumber, mealType, recipeName: item.recipe.name });

        this.changingMeal = {
            weekNumber,
            mealType, // 'lunch' or 'dinner'
            item,
            isBatch: true
        };

        // Show recipe browser in "changing mode"
        this.showRecipeBrowserModal(true);
    },

    /**
     * Confirm and execute recipe change
     */
    confirmChangeRecipe(recipe) {
        console.log('confirmChangeRecipe called with:', { recipeName: recipe.name, changingMeal: this.changingMeal });

        if (!this.changingMeal) {
            console.log('No meal being changed - just viewing recipe');
            return;
        }

        // Handle batch recipe change
        if (this.changingMeal.isBatch) {
            console.log('Handling batch recipe change');
            const { weekNumber, mealType, item } = this.changingMeal;

            // Get the week
            const week = App.currentMealPlan.weeks.find(w => w.weekNumber === weekNumber);
            if (!week) {
                console.error('Week not found:', weekNumber);
                alert('Error: Week not found');
                return;
            }

            // Find and update the item in the correct array
            const array = mealType === 'lunch' ? week.lunches : week.dinners;
            const index = array.findIndex(i => i.recipe.id === item.recipe.id);

            console.log('Found recipe at index:', index, 'in', mealType, 'array');

            if (index !== -1) {
                console.log('Replacing', array[index].recipe.name, 'with', recipe.name);
                // Update the recipe while keeping portions and days
                array[index].recipe = recipe;
                array[index].prepTime = MealPlanGenerator.parseTime(recipe.prepTime);
                array[index].cookTime = MealPlanGenerator.parseTime(recipe.cookTime);

                // Recalculate total cooking time
                week.totalCookingTime.prep = 0;
                week.totalCookingTime.cook = 0;
                [...week.lunches, ...week.dinners].forEach(item => {
                    week.totalCookingTime.prep += item.prepTime;
                    week.totalCookingTime.cook += item.cookTime;
                });
                week.totalCookingTime.total = week.totalCookingTime.prep + week.totalCookingTime.cook;
                week.totalCookingTime.formatted = MealPlanGenerator.formatCookingTime(week.totalCookingTime.total);
                console.log('Recipe changed successfully, re-rendering');
            } else {
                console.error('Could not find recipe in array');
            }

            // Save and re-render
            App.savePlan();
            this.renderMealPlan(App.currentMealPlan);

            // Close modal and reset state
            this.closeModal(this.elements.recipeBrowserModal);
            this.changingMeal = null;

            // Reset filter and hide changing message
            document.getElementById('proteinFilter').value = 'all';
            const changingMessage = document.getElementById('changingModeMessage');
            if (changingMessage) {
                changingMessage.style.display = 'none';
            }
            return;
        }

        // Handle old day-based meal change
        const { weekNumber, dayIndex, mealIndex } = this.changingMeal;

        // Get the week
        const week = App.currentMealPlan.weeks.find(w => w.weekNumber === weekNumber);
        if (!week) {
            alert('Error: Week not found');
            return;
        }

        // Get the day
        const day = week.days[dayIndex];
        if (!day) {
            alert('Error: Day not found');
            return;
        }

        // Get the meal
        const meal = day.meals[mealIndex];
        if (!meal) {
            alert('Error: Meal not found');
            return;
        }

        // Update the meal
        meal.name = recipe.name;
        meal.recipeId = recipe.id;
        meal.protein = recipe.protein;
        meal.isLeftover = false;
        delete meal.fromRecipeId;

        // Save and re-render
        App.savePlan();
        this.renderMealPlan(App.currentMealPlan);

        // Close modal and reset state
        this.closeModal(this.elements.recipeBrowserModal);
        this.changingMeal = null;

        // Reset filter and hide changing message
        document.getElementById('proteinFilter').value = 'all';
        const changingMessage = document.getElementById('changingModeMessage');
        if (changingMessage) {
            changingMessage.style.display = 'none';
        }
    },

    /**
     * Show config modal
     */
    showConfigModal() {
        // Load current config values
        const adultsInput = document.getElementById('adultsCount');
        const childrenInput = document.getElementById('childrenCount');
        const lunchPortions = document.getElementById('lunchPortions');
        const dinnerRecipes = document.getElementById('dinnerRecipes');
        const weekendFamily = document.getElementById('weekendFamilyMeals');
        const childSeparate = document.getElementById('childSeparateWeekdays');
        const numberOfWeeks = document.getElementById('numberOfWeeks');

        if (adultsInput) adultsInput.value = App.config.adults;
        if (childrenInput) childrenInput.value = App.config.children;
        if (lunchPortions) lunchPortions.value = App.config.lunchPortions || 10;
        if (dinnerRecipes) dinnerRecipes.value = App.config.dinnerRecipes || 3;
        if (weekendFamily) weekendFamily.checked = App.config.weekendFamilyMeals !== false;
        if (childSeparate) childSeparate.checked = App.config.childSeparateWeekdays !== false;
        if (numberOfWeeks) numberOfWeeks.value = App.config.numberOfWeeks || 1;

        this.openModal(this.elements.configModal);
    },

    /**
     * Save config from modal
     */
    saveConfig() {
        const adultsInput = document.getElementById('adultsCount');
        const childrenInput = document.getElementById('childrenCount');
        const lunchPortions = document.getElementById('lunchPortions');
        const dinnerRecipes = document.getElementById('dinnerRecipes');
        const weekendFamily = document.getElementById('weekendFamilyMeals');
        const childSeparate = document.getElementById('childSeparateWeekdays');
        const numberOfWeeks = document.getElementById('numberOfWeeks');

        const oldWeeks = App.config.numberOfWeeks;
        const newWeeks = parseInt(numberOfWeeks?.value) || 1;

        const config = {
            adults: parseInt(adultsInput?.value) || 2,
            children: parseInt(childrenInput?.value) || 0,
            lunchPortions: parseInt(lunchPortions?.value) || 10,
            dinnerRecipes: parseInt(dinnerRecipes?.value) || 3,
            weekendFamilyMeals: weekendFamily?.checked !== false,
            childSeparateWeekdays: childSeparate?.checked !== false,
            numberOfWeeks: newWeeks
        };

        App.updateConfig(config);

        // Show success message
        alert(`Settings saved!\n\n` +
            `Household: ${config.adults} adult${config.adults !== 1 ? 's' : ''} + ${config.children} child${config.children !== 1 ? 'ren' : ''}\n` +
            `Weeks to plan: ${config.numberOfWeeks}\n` +
            `Lunch portions/week: ${config.lunchPortions}\n` +
            `Different dinners/week: ${config.dinnerRecipes}\n\n` +
            `Click "Generate Meal Plan" to create a new plan with these settings.`);

        this.closeModal(this.elements.configModal);

        // If week count changed and there's an existing plan, regenerate automatically
        if (oldWeeks !== newWeeks && App.currentMealPlan) {
            console.log(`Week count changed from ${oldWeeks} to ${newWeeks}, regenerating plan`);
            setTimeout(() => App.generateNewPlan(), 500);
        }
    },

    /**
     * Update household summary display
     */
    updateHouseholdSummary() {
        const adultsInput = document.getElementById('adultsCount');
        const childrenInput = document.getElementById('childrenCount');
        const summary = document.getElementById('householdSummary');

        if (adultsInput && childrenInput && summary) {
            const adults = parseInt(adultsInput.value) || 0;
            const children = parseInt(childrenInput.value) || 0;

            const adultText = adults === 1 ? '1 adult' : `${adults} adults`;
            const childText = children === 0 ? 'no children' : children === 1 ? '1 child' : `${children} children`;

            summary.textContent = `${adultText} + ${childText}`;
        }
    },

    /**
     * Open edit days modal for a batch recipe
     */
    openEditDaysModal(weekNumber, mealType, item) {
        this.editingBatch = { weekNumber, mealType, item };

        // Show recipe name
        const recipeInfo = document.getElementById('editingRecipeInfo');
        recipeInfo.textContent = `Editing: ${item.recipe.name}`;

        // Populate checkboxes with current days
        const dayCheckboxes = document.querySelectorAll('.day-checkbox');
        dayCheckboxes.forEach(checkbox => {
            checkbox.checked = item.days.includes(checkbox.value);
        });

        // Update portions summary
        this.updatePortionsSummary();

        // Open modal
        this.openModal(this.elements.editBatchDaysModal);
    },

    /**
     * Update portions summary based on selected days
     */
    updatePortionsSummary() {
        if (!this.editingBatch) return;

        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);
        const numDays = selectedDays.length;

        const summary = document.getElementById('portionsSummary');

        if (numDays === 0) {
            summary.innerHTML = '<strong>⚠️ Please select at least one day</strong>';
            return;
        }

        // Calculate portions needed
        const config = App.config;
        const portionsPerDay = config.adults + (config.children * 0.5);
        const totalPortions = Math.ceil(portionsPerDay * numDays);

        // Get base servings
        let baseServings = 4;
        if (typeof this.editingBatch.item.recipe.servings === 'number') {
            baseServings = this.editingBatch.item.recipe.servings;
        } else if (typeof this.editingBatch.item.recipe.servings === 'string') {
            const match = this.editingBatch.item.recipe.servings.match(/(\d+)/);
            baseServings = match ? parseInt(match[1]) : 4;
        }

        const multiplier = (totalPortions / baseServings).toFixed(1);

        summary.innerHTML = `<strong>Selected:</strong> ${numDays} day${numDays > 1 ? 's' : ''} (${selectedDays.join(', ')})<br>` +
                           `<strong>Total portions needed:</strong> ${totalPortions}<br>` +
                           `<strong>Recipe multiplier:</strong> ${multiplier}x`;
    },

    /**
     * Save batch days changes
     */
    saveBatchDaysChanges() {
        if (!this.editingBatch) return;

        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);

        if (selectedDays.length === 0) {
            alert('Please select at least one day');
            return;
        }

        // Update the item with new days and portions
        const { weekNumber, mealType, item } = this.editingBatch;
        const config = App.config;
        const portionsPerDay = config.adults + (config.children * 0.5);
        const totalPortions = Math.ceil(portionsPerDay * selectedDays.length);

        item.days = selectedDays;
        item.portions = totalPortions;

        // Save and re-render
        App.savePlan();
        UI.renderMealPlan(App.currentMealPlan);

        // Close modal
        this.closeModal(this.elements.editBatchDaysModal);
        this.editingBatch = null;

        console.log('Batch days updated:', { weekNumber, mealType, days: selectedDays, portions: totalPortions });
    },

    /**
     * Split batch recipe to daily recipes
     */
    splitBatchToDaily() {
        if (!this.editingBatch) return;

        if (!confirm('This will split this batch recipe into separate daily entries. Continue?')) {
            return;
        }

        const { weekNumber, mealType, item } = this.editingBatch;
        const week = App.currentMealPlan.weeks[weekNumber - 1];
        const array = mealType === 'lunch' ? week.lunches : week.dinners;

        // Find the item in the array
        const index = array.findIndex(i =>
            i.recipe.id === item.recipe.id &&
            JSON.stringify(i.days) === JSON.stringify(item.days)
        );

        if (index === -1) {
            alert('Could not find recipe to split');
            return;
        }

        // Remove the batch item
        array.splice(index, 1);

        // Create individual daily items
        const config = App.config;
        const portionsPerDay = Math.ceil(config.adults + (config.children * 0.5));

        item.days.forEach(day => {
            array.push({
                recipe: item.recipe,
                days: [day],
                portions: portionsPerDay,
                prepTime: item.prepTime,
                cookTime: item.cookTime,
                isFamilyMeal: item.isFamilyMeal
            });
        });

        // Save and re-render
        App.savePlan();
        UI.renderMealPlan(App.currentMealPlan);

        // Close modal
        this.closeModal(this.elements.editBatchDaysModal);
        this.editingBatch = null;

        console.log('Batch recipe split to daily entries');
    }
};

/**
 * Tests for portion calculation and display
 * This tests the bug we had where servings was a number but we tried to call .match() on it
 */

describe('UI Portion Calculation', () => {
  describe('servings type handling', () => {
    test('handles numeric servings', () => {
      const recipe = {
        id: 'test-recipe',
        name: 'Test Recipe',
        servings: 6, // NUMBER not string
        prepTime: '15 minutes',
        cookTime: '30 minutes'
      };

      const item = {
        recipe: recipe,
        portions: 10,
        days: ['Monday', 'Tuesday'],
        prepTime: 15,
        cookTime: 30
      };

      // This should NOT throw "match is not a function"
      const baseServings = typeof item.recipe.servings === 'number'
        ? item.recipe.servings
        : parseInt(item.recipe.servings.match(/(\d+)/)[1]);

      expect(baseServings).toBe(6);

      const multiplier = (item.portions / baseServings).toFixed(1);
      expect(multiplier).toBe('1.7');
    });

    test('handles string servings like "4-6"', () => {
      const recipe = {
        id: 'test-recipe',
        name: 'Test Recipe',
        servings: '4-6', // STRING with range
        prepTime: '15 minutes',
        cookTime: '30 minutes'
      };

      const item = {
        recipe: recipe,
        portions: 10,
        days: ['Monday', 'Tuesday'],
        prepTime: 15,
        cookTime: 30
      };

      const baseServings = typeof item.recipe.servings === 'number'
        ? item.recipe.servings
        : parseInt(item.recipe.servings.match(/(\d+)/)[1]);

      expect(baseServings).toBe(4); // Should extract first number

      const multiplier = (item.portions / baseServings).toFixed(1);
      expect(multiplier).toBe('2.5');
    });

    test('handles string servings like "6"', () => {
      const recipe = {
        id: 'test-recipe',
        name: 'Test Recipe',
        servings: '6', // STRING single number
        prepTime: '15 minutes',
        cookTime: '30 minutes'
      };

      const item = {
        recipe: recipe,
        portions: 12,
        days: ['Monday', 'Tuesday'],
        prepTime: 15,
        cookTime: 30
      };

      const baseServings = typeof item.recipe.servings === 'number'
        ? item.recipe.servings
        : parseInt(item.recipe.servings.match(/(\d+)/)[1]);

      expect(baseServings).toBe(6);

      const multiplier = (item.portions / baseServings).toFixed(1);
      expect(multiplier).toBe('2.0');
    });

    test('defaults to 4 servings for invalid input', () => {
      const recipe = {
        id: 'test-recipe',
        name: 'Test Recipe',
        servings: null, // INVALID
        prepTime: '15 minutes',
        cookTime: '30 minutes'
      };

      const item = {
        recipe: recipe,
        portions: 8,
        days: ['Monday', 'Tuesday'],
        prepTime: 15,
        cookTime: 30
      };

      let baseServings = 4; // default
      if (typeof item.recipe.servings === 'number') {
        baseServings = item.recipe.servings;
      } else if (typeof item.recipe.servings === 'string') {
        const match = item.recipe.servings.match(/(\d+)/);
        baseServings = match ? parseInt(match[1]) : 4;
      }

      expect(baseServings).toBe(4); // Should use default

      const multiplier = (item.portions / baseServings).toFixed(1);
      expect(multiplier).toBe('2.0');
    });
  });

  describe('multiplier display', () => {
    test('shows "as per recipe" for 1.0x multiplier', () => {
      const baseServings = 6;
      const portions = 6;
      const multiplier = (portions / baseServings).toFixed(1);

      expect(multiplier).toBe('1.0');

      const displayText = multiplier === '1.0'
        ? `${portions} portions (as per recipe)`
        : `${multiplier}x the recipe (${portions} portions)`;

      expect(displayText).toBe('6 portions (as per recipe)');
    });

    test('shows multiplier for non-1.0x amounts', () => {
      const baseServings = 6;
      const portions = 10;
      const multiplier = (portions / baseServings).toFixed(1);

      expect(multiplier).toBe('1.7');

      const displayText = multiplier === '1.0'
        ? `${portions} portions (as per recipe)`
        : `${multiplier}x the recipe (${portions} portions)`;

      expect(displayText).toBe('1.7x the recipe (10 portions)');
    });

    test('shows multiplier for doubled recipe', () => {
      const baseServings = 4;
      const portions = 8;
      const multiplier = (portions / baseServings).toFixed(1);

      expect(multiplier).toBe('2.0');

      const displayText = multiplier === '1.0'
        ? `${portions} portions (as per recipe)`
        : `${multiplier}x the recipe (${portions} portions)`;

      expect(displayText).toBe('2.0x the recipe (8 portions)');
    });
  });
});

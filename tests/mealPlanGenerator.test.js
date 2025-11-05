// Mock recipes for testing
const mockRecipes = [
  {
    id: 'chicken-curry',
    name: 'Chicken Curry',
    protein: 'chicken',
    servings: 4,
    prepTime: '15 minutes',
    cookTime: '30 minutes',
    tags: ['batch-cooking', 'freezer-friendly']
  },
  {
    id: 'beef-stew',
    name: 'Beef Stew',
    protein: 'beef',
    servings: 6,
    prepTime: '20 minutes',
    cookTime: '2 hours',
    tags: ['batch-cooking', 'sunday-special']
  },
  {
    id: 'fish-tacos',
    name: 'Fish Tacos',
    protein: 'fish',
    servings: 4,
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    tags: ['weeknight']
  },
  {
    id: 'pork-chops',
    name: 'Pork Chops',
    protein: 'pork',
    servings: 4,
    prepTime: '5 minutes',
    cookTime: '20 minutes',
    tags: ['weeknight']
  },
  {
    id: 'lamb-roast',
    name: 'Lamb Roast',
    protein: 'lamb',
    servings: 8,
    prepTime: '30 minutes',
    cookTime: '90 minutes',
    tags: ['sunday-special', 'family-favorite']
  }
];

// Mock App config
global.App = {
  config: {
    adults: 2,
    children: 1,
    lunchPortions: 10,
    dinnerRecipes: 3,
    weekendFamilyMeals: true,
    childSeparateWeekdays: true,
    numberOfWeeks: 1
  }
};

// Load the actual meal plan generator
const fs = require('fs');
const path = require('path');
const generatorCode = fs.readFileSync(
  path.join(__dirname, '../js/mealPlanGenerator.js'),
  'utf8'
);
eval(generatorCode);

describe('MealPlanGenerator', () => {
  beforeEach(() => {
    // Reset recently used recipes before each test
    MealPlanGenerator.recentlyUsed = [];
  });

  describe('generate()', () => {
    test('generates a meal plan with correct number of weeks', () => {
      const plan = MealPlanGenerator.generate(mockRecipes);

      expect(plan).toBeDefined();
      expect(plan.weeks).toHaveLength(1);
      expect(plan.config).toBeDefined();
    });

    test('generates different plans on consecutive calls', () => {
      const plan1 = MealPlanGenerator.generate(mockRecipes);
      const plan2 = MealPlanGenerator.generate(mockRecipes);

      // Plans should have different generatedAt timestamps
      expect(plan1.generatedAt).not.toBe(plan2.generatedAt);

      // Plans should have different recipes (at least some)
      const recipes1 = plan1.weeks[0].lunches.concat(plan1.weeks[0].dinners)
        .map(item => item.recipe.id);
      const recipes2 = plan2.weeks[0].lunches.concat(plan2.weeks[0].dinners)
        .map(item => item.recipe.id);

      // At least one recipe should be different
      const allSame = recipes1.every((id, i) => id === recipes2[i]);
      expect(allSame).toBe(false);
    });

    test('generates plan with configured number of weeks', () => {
      App.config.numberOfWeeks = 3;
      const plan = MealPlanGenerator.generate(mockRecipes);

      expect(plan.weeks).toHaveLength(3);
    });

    test('each week has lunches and dinners arrays', () => {
      const plan = MealPlanGenerator.generate(mockRecipes);

      plan.weeks.forEach(week => {
        expect(week.lunches).toBeDefined();
        expect(week.dinners).toBeDefined();
        expect(Array.isArray(week.lunches)).toBe(true);
        expect(Array.isArray(week.dinners)).toBe(true);
      });
    });

    test('each week has cooking time calculated', () => {
      const plan = MealPlanGenerator.generate(mockRecipes);

      plan.weeks.forEach(week => {
        expect(week.totalCookingTime).toBeDefined();
        expect(week.totalCookingTime.prep).toBeGreaterThanOrEqual(0);
        expect(week.totalCookingTime.cook).toBeGreaterThanOrEqual(0);
        expect(week.totalCookingTime.total).toBe(
          week.totalCookingTime.prep + week.totalCookingTime.cook
        );
        expect(week.totalCookingTime.formatted).toBeDefined();
      });
    });
  });

  describe('parseTime()', () => {
    test('parses minutes correctly', () => {
      expect(MealPlanGenerator.parseTime('15 minutes')).toBe(15);
      expect(MealPlanGenerator.parseTime('30 min')).toBe(30);
    });

    test('parses hours correctly', () => {
      expect(MealPlanGenerator.parseTime('1 hour')).toBe(60);
      expect(MealPlanGenerator.parseTime('2 hours')).toBe(120);
      expect(MealPlanGenerator.parseTime('1 hr')).toBe(60);
    });

    test('handles invalid input', () => {
      expect(MealPlanGenerator.parseTime('')).toBe(0);
      expect(MealPlanGenerator.parseTime(null)).toBe(0);
      expect(MealPlanGenerator.parseTime('invalid')).toBe(0);
    });
  });

  describe('formatCookingTime()', () => {
    test('formats minutes under 60', () => {
      expect(MealPlanGenerator.formatCookingTime(15)).toBe('15 min');
      expect(MealPlanGenerator.formatCookingTime(45)).toBe('45 min');
    });

    test('formats hours exactly', () => {
      expect(MealPlanGenerator.formatCookingTime(60)).toBe('1h');
      expect(MealPlanGenerator.formatCookingTime(120)).toBe('2h');
    });

    test('formats hours and minutes', () => {
      expect(MealPlanGenerator.formatCookingTime(90)).toBe('1h 30min');
      expect(MealPlanGenerator.formatCookingTime(150)).toBe('2h 30min');
    });
  });

  describe('selectRecipe()', () => {
    test('excludes recently used recipes', () => {
      MealPlanGenerator.recentlyUsed = ['chicken-curry', 'beef-stew'];

      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {});

      expect(selected).toBeDefined();
      expect(['chicken-curry', 'beef-stew']).not.toContain(selected.id);
    });

    test('respects protein exclusions', () => {
      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {
        excludeProteins: ['chicken', 'beef']
      });

      expect(selected).toBeDefined();
      expect(['chicken', 'beef']).not.toContain(selected.protein);
    });

    test('prefers specific protein when requested', () => {
      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {
        preferProtein: 'fish'
      });

      expect(selected).toBeDefined();
      expect(selected.protein).toBe('fish');
    });

    test('filters by tags', () => {
      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {
        tags: ['sunday-special']
      });

      expect(selected).toBeDefined();
      expect(selected.tags).toContain('sunday-special');
    });

    test('adds selected recipe to recently used', () => {
      MealPlanGenerator.recentlyUsed = [];

      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {});

      expect(MealPlanGenerator.recentlyUsed).toContain(selected.id);
    });

    test('falls back when no candidates match all criteria', () => {
      MealPlanGenerator.recentlyUsed = mockRecipes.slice(0, 4).map(r => r.id);

      const selected = MealPlanGenerator.selectRecipe(mockRecipes, {
        tags: ['batch-cooking'],
        excludeProteins: []
      });

      // Should still find something even with limited options
      expect(selected).toBeDefined();
    });
  });

  describe('generateWeek()', () => {
    test('generates lunches for weekdays', () => {
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      expect(week.lunches).toHaveLength(1);
      expect(week.lunches[0].days).toHaveLength(5); // Mon-Fri
      expect(week.lunches[0].days).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
      ]);
    });

    test('generates correct number of dinners', () => {
      App.config.dinnerRecipes = 3;
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      expect(week.dinners.length).toBeLessThanOrEqual(3);
      expect(week.dinners.length).toBeGreaterThan(0);
    });

    test('dinner days cover the whole week', () => {
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      const allDays = week.dinners.flatMap(d => d.days);
      expect(allDays).toHaveLength(7);
    });

    test('marks weekend meals as family meals when configured', () => {
      App.config.weekendFamilyMeals = true;
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      const weekendDinners = week.dinners.filter(d =>
        d.days.some(day => ['Saturday', 'Sunday'].includes(day))
      );

      if (weekendDinners.length > 0) {
        weekendDinners.forEach(dinner => {
          expect(dinner.isFamilyMeal).toBe(true);
        });
      }
    });

    test('calculates correct portion counts for lunches', () => {
      App.config.lunchPortions = 10;
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      expect(week.lunches[0].portions).toBe(10);
    });

    test('calculates portion counts for dinners based on days and household', () => {
      App.config.adults = 2;
      App.config.children = 1;
      const week = MealPlanGenerator.generateWeek(mockRecipes, 1, App.config);

      week.dinners.forEach(dinner => {
        const expectedPortions = dinner.days.length * 3; // 2 adults + 1 child
        expect(dinner.portions).toBe(expectedPortions);
      });
    });
  });
});

# Unit Tests for Family Meal Planner

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Structure

- `mealPlanGenerator.test.js` - Tests for meal plan generation logic
  - Recipe selection
  - Time parsing and formatting
  - Week generation
  - Portion calculation

- `ui.portions.test.js` - Tests for portion calculation and display
  - Handles both number and string servings
  - Multiplier calculation
  - Display text formatting

## What These Tests Prevent

### Bug: "match is not a function"
**What happened:** The `servings` field in recipes.json is a number (e.g., `6`), but the code tried to call `.match()` on it, which only works on strings.

**Test that catches it:** `ui.portions.test.js` tests both numeric and string servings

**How it helps:** If someone changes the portion calculation code, these tests will fail immediately if they break the type handling.

### Bug: Generate creates same plan every time
**What happened:** No tracking of recently used recipes, so clicking "Generate" gave the same recipes.

**Test that catches it:** `mealPlanGenerator.test.js` - "generates different plans on consecutive calls"

**How it helps:** Ensures that `recentlyUsed` tracking works correctly.

### Bug: Week container not found
**What happened:** Code didn't check if DOM elements exist before accessing them.

**Test that catches it:** Currently not tested (requires DOM testing setup)

**TODO:** Add DOM rendering tests

## Adding New Tests

When adding new features or fixing bugs:

1. **Write a failing test first** that demonstrates the bug
2. **Fix the bug**
3. **Verify the test passes**
4. **Commit both test and fix together**

Example:
```javascript
test('handles new feature X', () => {
  // Arrange: Set up test data
  const input = {...};

  // Act: Run the code
  const result = myFunction(input);

  // Assert: Verify it works
  expect(result).toBe(expectedValue);
});
```

## Continuous Integration

Tests run automatically on every pull request via GitHub Actions.
PRs cannot be merged if tests fail.

This ensures bugs are caught before they reach production!

# 🍽️ Family Meal Planner

An intelligent, mobile-first web application that eliminates meal planning decision fatigue for busy UK families.

## 🎯 Overview

The Meal Plan Automator is a single-page web application designed specifically for a UK family (two parents + 3-year-old Ava) that automatically generates practical 4-week rotating meal plans. The app follows their real-life cooking habits: batch cooking on Sundays, utilizing leftovers, and ensuring variety without the weekly stress of deciding what to cook.

## ✨ Key Features

- **🔄 Automated 4-Week Meal Plans**: Generate complete meal plans with one click
- **📅 Batch Cooking Support**: Built-in Sunday batch cooking day strategy
- **♻️ Smart Leftovers Management**: Automatically schedules leftovers for lunches
- **🐟 Variety Rules**: Ensures no same protein consecutive days, includes fish weekly
- **👧 Ava-Friendly**: All recipes are 3-year-old approved with special notes
- **🛒 Shopping Lists**: Auto-generate organized shopping lists by UK supermarket category
- **📱 Mobile-First Design**: Optimized for iPhone, works like a native app
- **💾 Offline Support**: Uses localStorage to save your meal plan
- **🇬🇧 UK-Focused**: Recipes and ingredients from Aldi & Asda

## 🏗️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Mobile-first responsive design with CSS Grid and Flexbox
- **Data**: JSON-based recipe storage
- **Storage**: Browser localStorage for persistence
- **Deployment**: GitHub Pages ready (zero cost hosting)

## 📁 Project Structure

```
family_meal_planner/
├── README.md                    # This file
└── website/                     # Main application directory
    ├── index.html              # Single-page application
    ├── README.md               # Deployment guide
    ├── css/
    │   └── styles.css         # Mobile-first styles
    ├── js/
    │   ├── app.js             # Main application controller
    │   ├── mealPlanGenerator.js    # Meal planning logic
    │   ├── shoppingListGenerator.js # Shopping list generator
    │   └── ui.js              # UI interactions and rendering
    └── data/
        └── recipes.json       # 20 family recipes
```

## 🚀 Quick Start

### Option 1: View Locally

1. Clone this repository
2. Open `website/index.html` in your web browser
3. Click "Generate New Plan" to create your first meal plan

### Option 2: Deploy to GitHub Pages

See the detailed deployment guide in `website/README.md`.

Quick version:
1. Fork this repository
2. Go to Settings → Pages
3. Select main branch and root folder
4. Access your site at `https://[username].github.io/family_meal_planner/`

## 🎨 Design Philosophy

### Mobile-First
The app is designed primarily for iPhone use, as meal planning often happens on-the-go. The interface is:
- Touch-optimized with large tap targets
- Clean and minimal to reduce cognitive load
- Fast-loading with no framework overhead

### Intelligent Automation
The meal plan generator follows real family cooking patterns:
- **Sunday**: Batch cooking 2-3 large recipes
- **Monday**: Uses Sunday leftovers
- **Tuesday-Thursday**: Mix of quick meals and frozen batch-cooked meals
- **Friday**: Flexible (often leftovers or quick meal)
- **Saturday**: Regular cooking day
- **All Lunches**: Primarily leftovers from previous dinners

### Family-Centric
Every recipe includes:
- Ava-friendly notes (no alcohol, child-appropriate)
- Storage and freezing information
- Optional adults-only variations
- UK supermarket availability (Aldi/Asda)

## 📝 Customizing Recipes

To add your own recipes, edit `website/data/recipes.json`. Each recipe follows this structure:

```json
{
  "id": "unique-id",
  "name": "Recipe Name",
  "protein": "chicken|beef|pork|fish|lamb",
  "cookingTime": "45 minutes",
  "difficulty": "easy",
  "servings": 4,
  "tags": ["batch-cooking", "freezer-friendly"],
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "avaFriendly": "Child-friendly notes",
  "adultsVariation": "Optional adult additions",
  "storageNotes": "Freezing/storage info"
}
```

### Recipe Tags

- `batch-cooking`: Large recipes suitable for Sunday
- `sunday-special`: Specifically for Sunday roasts/big meals
- `quick-prep`: Weeknight-friendly (< 30 mins)
- `weeknight`: Regular evening meals
- `freezer-friendly`: Can be frozen and reheated
- `kid-favorite`: Ava's favorites
- `comfort-food`: Hearty, filling meals
- `interactive-meal`: Build-your-own (fajitas, tacos)
- `one-pan`: Easy cleanup

## 🔧 Technical Details

### Meal Plan Generation Algorithm

The generator ensures:
1. **Protein Variety**: Tracks previous day's protein, excludes same protein next day
2. **Fish Requirement**: Ensures at least 1 fish meal per week
3. **Batch Cooking**: Prioritizes batch-cooking tagged recipes for Sunday
4. **Smart Leftovers**: Links leftovers to their source recipes
5. **Day-Specific Logic**: Different meal selection for each day type

### Shopping List Categories

Ingredients are automatically sorted into UK supermarket sections:
- Fresh Produce
- Meat & Fish
- Dairy & Eggs
- Bakery
- Pantry
- Frozen
- Other

### Browser Compatibility

Tested and optimized for:
- ✅ Safari (iOS & macOS)
- ✅ Chrome (desktop & mobile)
- ✅ Firefox
- ✅ Edge

## 📱 Installing as iPhone App

1. Open the site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Name it and tap "Add"

The app will behave like a native iOS app with full-screen mode and app icon.

## 🎯 Family Requirements

This app is specifically designed for:
- 🇬🇧 UK-based families
- 🏪 Shopping at Aldi & Asda
- 👶 Young children (3+ years)
- 🥩 Meat/fish eaters (no vegetarian)
- 🍳 Batch cooking lifestyle
- ⏰ Busy schedules
- 📵 Minimal tech knowledge required

## 🔄 Future Enhancements

Potential features to add:
- [ ] Export shopping list to Notes app
- [ ] Recipe search and filter
- [ ] Custom recipe additions via UI
- [ ] Dietary restriction filters
- [ ] Meal plan sharing between devices
- [ ] Print-friendly views
- [ ] Nutritional information
- [ ] Cost tracking

## 📄 License

This is a personal family project. Feel free to fork and customize for your own use.

## 🙏 Acknowledgments

Built with love for busy parents who want to:
- ✅ Eat healthy, home-cooked meals
- ✅ Avoid daily "what's for dinner?" stress
- ✅ Make efficient use of batch cooking
- ✅ Reduce food waste through smart leftover planning
- ✅ Keep the whole family (including toddlers) happy

---

**Made with ❤️ for the modern family**

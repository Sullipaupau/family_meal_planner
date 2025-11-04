# 🍽️ Meal Plan Automator

A mobile-first web application designed to eliminate decision fatigue for busy UK families. Automatically generates a practical, 4-week rotating meal plan based on your family's recipes and lifestyle.

## 📱 Features

- **4-Week Rotating Meal Plan**: Automatically generates varied, practical meal plans
- **Batch Cooking Strategy**: Built-in support for Sunday batch cooking
- **Smart Leftovers**: Automatically schedules leftovers for lunches
- **Variety Rules**: Ensures protein variety and includes fish weekly
- **Recipe Details**: Tap any meal to see full recipe with Ava-friendly tips
- **Shopping Lists**: Generate organized shopping lists by UK supermarket category
- **Offline Support**: Saves your meal plan in your browser
- **iPhone Optimized**: Designed to feel like a native iOS app

## 🏗️ Project Structure

```
website/
├── index.html              # Main application page
├── README.md              # This file
├── css/
│   └── styles.css         # Mobile-first responsive styles
├── js/
│   ├── app.js             # Main application logic
│   ├── mealPlanGenerator.js  # Meal plan generation with family rules
│   ├── shoppingListGenerator.js  # Shopping list organization
│   └── ui.js              # User interface interactions
└── data/
    └── recipes.json       # Recipe database
```

## 🚀 Viewing Locally

To view the application on your computer:

1. **Download the website folder** to your computer
2. **Open index.html** in a web browser:
   - Right-click on `index.html`
   - Select "Open with" → Your preferred browser (Chrome, Safari, Firefox)
3. The app will load and be ready to use!

**Note**: The app uses only HTML, CSS, and JavaScript - no server required!

## 🌐 Deploying to GitHub Pages

Follow these simple steps to host your Meal Plan Automator online for free using GitHub Pages:

### Step 1: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the registration steps

### Step 2: Create a New Repository

1. Log in to GitHub
2. Click the **+** icon in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `meal-plan-automator` (or any name you prefer)
   - **Description**: "4-week family meal planner"
   - **Public** or **Private**: Choose "Public" (required for free GitHub Pages)
   - **DO NOT** check "Initialize with README" (we already have files)
5. Click **"Create repository"**

### Step 3: Upload Your Files

GitHub provides several ways to upload files. Here's the easiest method for non-technical users:

#### Method 1: Using GitHub's Web Interface (Easiest)

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL the files from your `website` folder:
   - `index.html`
   - The `css` folder
   - The `js` folder
   - The `data` folder
   - `README.md`
3. Add a commit message: "Initial upload of Meal Plan Automator"
4. Click **"Commit changes"**

#### Method 2: Using GitHub Desktop (Recommended if you'll update recipes)

1. Download and install [GitHub Desktop](https://desktop.github.com)
2. Open GitHub Desktop and sign in
3. Click **File** → **Clone repository**
4. Select your `meal-plan-automator` repository and choose where to save it
5. Copy all files from your `website` folder into the cloned repository folder
6. In GitHub Desktop:
   - You'll see all the new files listed
   - Add a summary: "Initial upload"
   - Click **"Commit to main"**
   - Click **"Push origin"**

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub.com
2. Click **"Settings"** (top menu)
3. Scroll down and click **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **"Save"**

### Step 5: Access Your Website

1. GitHub will take 1-2 minutes to publish your site
2. Your website will be available at:
   ```
   https://[your-username].github.io/meal-plan-automator/
   ```
   Replace `[your-username]` with your GitHub username

3. You can find the exact URL on the "Pages" settings page

### 🎉 Done!

Your Meal Plan Automator is now live and accessible from any device with internet access!

## 📝 Customizing Your Recipes

To add your own 20 recipes to the app:

1. Open `data/recipes.json` in a text editor (Notepad, TextEdit, or VS Code)
2. Follow the existing recipe format:

```json
{
  "id": "unique-recipe-id",
  "name": "Recipe Name",
  "protein": "chicken|beef|pork|fish|lamb",
  "cookingTime": "45 minutes",
  "difficulty": "easy|medium|hard",
  "servings": 4,
  "tags": ["batch-cooking", "quick-prep", "freezer-friendly", "weeknight"],
  "ingredients": [
    "List of ingredients",
    "With quantities"
  ],
  "instructions": [
    "Step-by-step instructions",
    "One step per line"
  ],
  "avaFriendly": "Tips for making this suitable for Ava",
  "adultsVariation": "Optional additions for adults",
  "storageNotes": "Freezing and storage information"
}
```

3. Save the file
4. If using GitHub Pages, upload the updated `recipes.json` file:
   - Go to your repository
   - Navigate to `data/recipes.json`
   - Click the pencil icon to edit
   - Paste your new content
   - Commit changes

## 🏪 UK Shopping Categories

The app organizes shopping lists into these categories:
- 🥬 Fresh Produce
- 🥩 Meat & Fish
- 🥛 Dairy & Eggs
- 🍞 Bakery
- 🥫 Pantry
- ❄️ Frozen
- 📦 Other

## 🔄 Updating Your Live Site

After making any changes to your recipes or website:

**Using Web Interface:**
1. Go to your GitHub repository
2. Navigate to the file you want to update
3. Click the pencil icon (Edit)
4. Make your changes
5. Commit changes
6. Wait 1-2 minutes for GitHub Pages to update

**Using GitHub Desktop:**
1. Make changes to your local files
2. Open GitHub Desktop
3. Commit your changes
4. Push to origin
5. Wait 1-2 minutes for GitHub Pages to update

## 💾 Browser Storage

The app automatically saves your current meal plan in your browser's localStorage. This means:
- ✅ Your plan persists between sessions
- ✅ No internet required after first load
- ⚠️ Clearing browser data will delete your saved plan
- ⚠️ Plans are device-specific (not synced between devices)

## 📱 Adding to iPhone Home Screen

For the best mobile experience:

1. Open the website in Safari on your iPhone
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Meal Planner"
5. Tap "Add"

The app will now appear on your home screen like a native app!

## 🐛 Troubleshooting

**Problem**: Website shows "Failed to load recipes"
- **Solution**: Make sure `data/recipes.json` is uploaded and in the correct folder

**Problem**: GitHub Pages shows 404 error
- **Solution**: Wait 2-3 minutes after enabling Pages, then refresh

**Problem**: Changes don't appear on live site
- **Solution**: Clear your browser cache or wait a few minutes for GitHub to update

**Problem**: Meal plan disappeared
- **Solution**: Browser data was cleared. Click "Generate New Plan" to create a fresh plan

## 🎯 Family Requirements

This app is specifically designed for:
- 🇬🇧 UK families shopping at Aldi & Asda
- 👨‍👩‍👧 Two parents + 3-year-old (Ava)
- 🥩 No vegetarian meals (all recipes include meat or fish)
- 👶 Child-friendly (no alcohol in base recipes)
- 🍳 Batch cooking on Sundays
- ♻️ Smart leftover utilization
- 🐟 Minimum one fish meal per week
- 🔄 No same protein two days in a row

## 📞 Support

If you encounter any issues or need help:
1. Check the Troubleshooting section above
2. Ensure all files are uploaded correctly
3. Verify your recipes.json is valid JSON format
4. Clear browser cache and refresh

## 📄 License

This is a personal family project. Feel free to fork and customize for your own use!

---

**Made with ❤️ for busy families who want to eat well without the daily "what's for dinner?" stress!**

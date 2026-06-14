/**
 * Nutrition Service
 *
 * Handles recommended daily values, deficiency detection,
 * and smart snack suggestions based on user profile.
 */

// Recommended Daily Values by gender (baseline for a "moderate" activity level)
const RDV = {
  male:   { calories: 2400, protein: 60, carbs: 300, fat: 65, iron: 17 },
  female: { calories: 2000, protein: 50, carbs: 250, fat: 55, iron: 21 },
  other:  { calories: 2200, protein: 55, carbs: 275, fat: 60, iron: 19 },
};

// Multipliers that scale calorie and macro targets by activity level
const ACTIVITY_MULTIPLIERS = {
  sedentary:   0.85,
  light:       0.95,
  moderate:    1.0,
  active:      1.15,
  very_active: 1.3,
};

/**
 * Get the recommended daily nutrients for a given user profile.
 * Applies an activity-level multiplier on top of the gender baseline.
 *
 * @param {Object} userProfile - Must contain `gender` and `activityLevel`
 * @returns {Object} { calories, protein, carbs, fat, iron }
 */
const getDailyRecommended = (userProfile) => {
  const gender = userProfile.gender || 'other';
  const activity = userProfile.activityLevel || 'moderate';
  const base = { ...RDV[gender] };
  const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.0;

  // Scale everything except iron (iron need is gender-specific, not activity-dependent)
  base.calories = Math.round(base.calories * multiplier);
  base.protein  = Math.round(base.protein * multiplier);
  base.carbs    = Math.round(base.carbs * multiplier);
  base.fat      = Math.round(base.fat * multiplier);
  // iron stays the same

  return base;
};

/**
 * Compare the user's actual intake against recommended values and
 * flag any nutrients that fall below safe thresholds.
 *
 * @param {Object} totalNutrients - { calories, protein, carbs, fat, iron }
 * @param {Object} userProfile    - User document from MongoDB
 * @returns {Array} Array of deficiency objects with severity ratings
 */
const detectDeficiencies = (totalNutrients, userProfile) => {
  const recommended = getDailyRecommended(userProfile);
  const deficiencies = [];

  const nutrientNames = ['calories', 'protein', 'carbs', 'fat', 'iron'];

  for (const nutrient of nutrientNames) {
    const current = totalNutrients[nutrient] || 0;
    const rec = recommended[nutrient];
    const percentage = Math.round((current / rec) * 100);

    // Only flag if below 90% of recommended
    if (percentage < 90) {
      let severity;
      if (percentage < 50) {
        severity = 'critical';
      } else if (percentage < 75) {
        severity = 'moderate';
      } else {
        severity = 'low';
      }

      deficiencies.push({
        nutrient,
        current: Math.round(current),
        recommended: rec,
        percentage,
        severity,
      });
    }
  }

  return deficiencies;
};

/**
 * Suggest hostel-friendly snacks to address detected deficiencies.
 * Filters by the user's food preference and remaining daily budget.
 *
 * @param {Array}  deficiencies    - Output from detectDeficiencies()
 * @param {number} remainingBudget - How many rupees the user has left today
 * @param {string} foodPreference  - 'veg' | 'non-veg' | 'vegan'
 * @returns {Array} Snack suggestion objects
 */
const getSnackSuggestions = (deficiencies, remainingBudget, foodPreference) => {
  // Master list of hostel-friendly snacks with their nutrient highlights
  const allSnacks = [
    // ---- Protein boosters ----
    { name: 'Boiled Eggs (2)',       nutrients: { protein: 12, calories: 140, iron: 1.2 }, estimatedCost: 20, category: 'protein', preference: ['non-veg'] },
    { name: 'Paneer Tikka (100g)',   nutrients: { protein: 18, calories: 260, iron: 1.5 }, estimatedCost: 40, category: 'protein', preference: ['veg', 'non-veg'] },
    { name: 'Sprouts Chaat',         nutrients: { protein: 12, calories: 180, iron: 3.0 }, estimatedCost: 25, category: 'protein', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Roasted Peanuts (50g)', nutrients: { protein: 13, calories: 280, iron: 1.3 }, estimatedCost: 15, category: 'protein', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Roasted Chana (50g)',   nutrients: { protein: 10, calories: 180, iron: 2.5 }, estimatedCost: 15, category: 'protein', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Curd / Dahi (200ml)',   nutrients: { protein: 8,  calories: 120, iron: 0.2 }, estimatedCost: 20, category: 'protein', preference: ['veg', 'non-veg'] },

    // ---- Iron boosters ----
    { name: 'Jaggery (Gur) 30g',    nutrients: { protein: 0.5, calories: 100, iron: 3.0 }, estimatedCost: 10, category: 'iron', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Dates (5 pieces)',      nutrients: { protein: 1,   calories: 140, iron: 2.5 }, estimatedCost: 20, category: 'iron', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Poha (1 plate)',        nutrients: { protein: 5,   calories: 250, iron: 8.0 }, estimatedCost: 20, category: 'iron', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Palak Paratha',         nutrients: { protein: 6,   calories: 200, iron: 4.0 }, estimatedCost: 25, category: 'iron', preference: ['veg', 'non-veg'] },

    // ---- Calorie / energy boosters ----
    { name: 'Banana (2)',            nutrients: { protein: 2,   calories: 180, iron: 0.5 }, estimatedCost: 10, category: 'calories', preference: ['veg', 'non-veg', 'vegan'] },
    { name: 'Bread + Butter',       nutrients: { protein: 4,   calories: 250, iron: 1.0 }, estimatedCost: 15, category: 'calories', preference: ['veg', 'non-veg'] },
    { name: 'Aloo Paratha',         nutrients: { protein: 6,   calories: 300, iron: 2.0 }, estimatedCost: 30, category: 'calories', preference: ['veg', 'non-veg'] },
    { name: 'Samosa (2)',            nutrients: { protein: 4,   calories: 300, iron: 1.5 }, estimatedCost: 20, category: 'calories', preference: ['veg', 'non-veg'] },
    { name: 'Glucose Biscuits Pack', nutrients: { protein: 3,   calories: 200, iron: 1.0 }, estimatedCost: 10, category: 'calories', preference: ['veg', 'non-veg', 'vegan'] },

    // ---- General / carb / fat ----
    { name: 'Masala Chai + Toast',   nutrients: { protein: 3,   calories: 150, iron: 0.5, carbs: 20, fat: 5 }, estimatedCost: 15, category: 'carbs', preference: ['veg', 'non-veg'] },
    { name: 'Upma (1 bowl)',         nutrients: { protein: 5,   calories: 220, iron: 2.0, carbs: 35, fat: 7 }, estimatedCost: 20, category: 'carbs', preference: ['veg', 'non-veg', 'vegan'] },
  ];

  // Determine which nutrient categories are deficient
  const deficientCategories = new Set();
  for (const d of deficiencies) {
    deficientCategories.add(d.nutrient); // 'calories', 'protein', 'iron', etc.
  }

  // Filter snacks: must match food preference, fit the budget, and address a deficiency
  const suggestions = allSnacks
    .filter((snack) => {
      // Food preference filter
      if (!snack.preference.includes(foodPreference)) return false;
      // Budget filter
      if (snack.estimatedCost > remainingBudget) return false;
      // Relevance filter: the snack's category should match a deficiency
      if (!deficientCategories.has(snack.category)) return false;
      return true;
    })
    .map((snack) => ({
      name: snack.name,
      nutrients: snack.nutrients,
      estimatedCost: snack.estimatedCost,
      reason: `Helps with low ${snack.category} intake`,
    }));

  return suggestions;
};

module.exports = { getDailyRecommended, detectDeficiencies, getSnackSuggestions };

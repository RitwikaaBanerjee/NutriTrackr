const Meal = require('../models/Meal');
const User = require('../models/User');
const { getDailyRecommended, detectDeficiencies } = require('./nutritionService');

/**
 * Alert Service
 *
 * Runs various health/budget checks and returns actionable alerts
 * that can be shown to the user on login or on the dashboard.
 */

/**
 * Check if the user has skipped any main meals today.
 *
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {Date}   date   - The date to check (usually today)
 * @returns {Array<string>} List of missing meal types (e.g. ['breakfast', 'dinner'])
 */
const checkMealSkipped = async (userId, date) => {
  // Build a date range covering the full calendar day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Get distinct meal types the user logged today
  const meals = await Meal.find({
    userId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  const loggedTypes = new Set(meals.map((m) => m.mealType));

  // Check the three main meals (snack is optional)
  const mainMeals = ['breakfast', 'lunch', 'dinner'];
  const missing = mainMeals.filter((type) => !loggedTypes.has(type));

  return missing;
};

/**
 * Look back over the last N days and flag nutrients that are
 * consistently below recommended levels.
 *
 * @param {string} userId - MongoDB ObjectId
 * @param {number} days   - How many days to look back (default 3)
 * @returns {Array} Array of persistent deficiency objects
 */
const checkMultiDayDeficiency = async (userId, days = 3) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const meals = await Meal.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  if (meals.length === 0) return [];

  // Group meals by calendar day
  const dailyTotals = {};
  for (const meal of meals) {
    const dayKey = meal.date.toISOString().split('T')[0];
    if (!dailyTotals[dayKey]) {
      dailyTotals[dayKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 };
    }
    dailyTotals[dayKey].calories += meal.nutrients?.calories || 0;
    dailyTotals[dayKey].protein  += meal.nutrients?.protein || 0;
    dailyTotals[dayKey].carbs    += meal.nutrients?.carbs || 0;
    dailyTotals[dayKey].fat      += meal.nutrients?.fat || 0;
    dailyTotals[dayKey].iron     += meal.nutrients?.iron || 0;
  }

  // For each day, run deficiency detection
  const recommended = getDailyRecommended(user);
  const nutrientDeficiencyCount = { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 };
  const totalDays = Object.keys(dailyTotals).length;

  for (const dayKey of Object.keys(dailyTotals)) {
    const deficiencies = detectDeficiencies(dailyTotals[dayKey], user);
    for (const d of deficiencies) {
      nutrientDeficiencyCount[d.nutrient]++;
    }
  }

  // Flag nutrients that were deficient on ALL checked days
  const persistentDeficiencies = [];
  for (const [nutrient, count] of Object.entries(nutrientDeficiencyCount)) {
    if (count >= totalDays && totalDays >= 2) {
      persistentDeficiencies.push({
        nutrient,
        daysDeficient: count,
        totalDays,
        message: `Your ${nutrient} intake has been low for the last ${count} days.`,
      });
    }
  }

  return persistentDeficiencies;
};

/**
 * Check if the user has exceeded their daily food budget.
 *
 * @param {string} userId - MongoDB ObjectId
 * @param {Date}   date   - The date to check
 * @returns {Object|null} Alert object if budget exceeded, null otherwise
 */
const checkBudgetExceeded = async (userId, date) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const meals = await Meal.find({
    userId,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  const totalSpent = meals.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);

  if (totalSpent > user.dailyBudget) {
    return {
      totalSpent: Math.round(totalSpent),
      budget: user.dailyBudget,
      exceeded: Math.round(totalSpent - user.dailyBudget),
    };
  }

  return null;
};

/**
 * Aggregate all alert checks into a single array for the dashboard.
 *
 * @param {string} userId - MongoDB ObjectId
 * @returns {Array} Combined alerts with type, message, and severity
 */
const getLoginAlerts = async (userId) => {
  const alerts = [];
  const today = new Date();

  // 1. Check for skipped meals
  try {
    const missingMeals = await checkMealSkipped(userId, today);
    for (const meal of missingMeals) {
      alerts.push({
        type: 'meal_skipped',
        message: `You haven't logged ${meal} today. Don't skip meals!`,
        severity: 'moderate',
      });
    }
  } catch (error) {
    console.error('Alert check (meal skipped) failed:', error.message);
  }

  // 2. Check for multi-day deficiencies
  try {
    const persistent = await checkMultiDayDeficiency(userId, 3);
    for (const d of persistent) {
      alerts.push({
        type: 'persistent_deficiency',
        message: d.message,
        severity: 'critical',
      });
    }
  } catch (error) {
    console.error('Alert check (multi-day deficiency) failed:', error.message);
  }

  // 3. Check budget
  try {
    const budgetAlert = await checkBudgetExceeded(userId, today);
    if (budgetAlert) {
      alerts.push({
        type: 'budget_exceeded',
        message: `You've spent ₹${budgetAlert.totalSpent} today, exceeding your ₹${budgetAlert.budget} budget by ₹${budgetAlert.exceeded}.`,
        severity: 'moderate',
      });
    }
  } catch (error) {
    console.error('Alert check (budget) failed:', error.message);
  }

  return alerts;
};

module.exports = {
  checkMealSkipped,
  checkMultiDayDeficiency,
  checkBudgetExceeded,
  getLoginAlerts,
};

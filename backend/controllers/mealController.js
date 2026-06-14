const Meal = require('../models/Meal');
const User = require('../models/User');
const { getDailyRecommended } = require('../services/nutritionService');

/**
 * Meal Controller
 *
 * CRUD operations for meal entries. Every meal is linked to
 * the authenticated user's MongoDB document.
 */

/**
 * POST /api/meals/add
 * Log a new meal entry.
 */
const addMeal = async (req, res) => {
  try {
    const { mealType, description, nutrients, estimatedCost, date } = req.body;

    if (!mealType || !description) {
      return res.status(400).json({
        success: false,
        message: 'mealType and description are required.',
      });
    }

    // Resolve the MongoDB user from the Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const meal = await Meal.create({
      userId: user._id,
      mealType,
      description,
      nutrients: nutrients || {},
      estimatedCost: estimatedCost || 0,
      date: date ? new Date(date) : new Date(),
    });

    console.log(`🍽️  Meal logged: ${mealType} for ${user.email}`);
    return res.status(201).json({ success: true, data: meal });
  } catch (error) {
    console.error('❌ Add meal error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error adding meal.' });
  }
};

/**
 * GET /api/meals/today
 * Fetch all of today's meals for the authenticated user,
 * plus compute running daily totals.
 */
const getTodayMeals = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Build today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ createdAt: -1 });

    // Sum up today's totals
    const dailyTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      iron: 0,
      totalCost: 0,
    };

    for (const meal of meals) {
      dailyTotals.calories += meal.nutrients?.calories || 0;
      dailyTotals.protein  += meal.nutrients?.protein || 0;
      dailyTotals.carbs    += meal.nutrients?.carbs || 0;
      dailyTotals.fat      += meal.nutrients?.fat || 0;
      dailyTotals.iron     += meal.nutrients?.iron || 0;
      dailyTotals.totalCost += meal.estimatedCost || 0;
    }

    // Round everything for cleaner display
    for (const key of Object.keys(dailyTotals)) {
      dailyTotals[key] = Math.round(dailyTotals[key] * 10) / 10;
    }

    // Get recommended daily values for this user
    const recommended = getDailyRecommended(user);

    return res.status(200).json({
      success: true,
      data: { meals, totals: dailyTotals, recommended },
    });
  } catch (error) {
    console.error('❌ Get today meals error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching meals.' });
  }
};

/**
 * GET /api/meals/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Fetch meals within a date range for the authenticated user.
 */
const getMealHistory = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { startDate, endDate } = req.query;

    // Default to last 7 days if no range is provided
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) {
      start.setDate(start.getDate() - 7);
    }
    start.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: meals,
      meta: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        count: meals.length,
      },
    });
  } catch (error) {
    console.error('❌ Get meal history error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching meal history.' });
  }
};

/**
 * DELETE /api/meals/:id
 * Delete a specific meal. Verifies the meal belongs to the authenticated user.
 */
const deleteMeal = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found.' });
    }

    // Ownership check: make sure this meal belongs to the requesting user
    if (meal.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this meal.' });
    }

    await Meal.findByIdAndDelete(req.params.id);

    console.log(`🗑️  Meal deleted: ${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Meal deleted successfully.' });
  } catch (error) {
    console.error('❌ Delete meal error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting meal.' });
  }
};

module.exports = { addMeal, getTodayMeals, getMealHistory, deleteMeal };

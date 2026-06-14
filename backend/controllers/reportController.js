const Meal = require('../models/Meal');
const User = require('../models/User');
const { getDailyRecommended, detectDeficiencies, getSnackSuggestions } = require('../services/nutritionService');
const { getLoginAlerts } = require('../services/alertService');
const { generateReport } = require('../utils/pdfGenerator');

/**
 * Report Controller
 *
 * Weekly nutrition reports, PDF download, and health alerts.
 */

/**
 * GET /api/report/weekly
 * Aggregate the last 7 days of meals, compute daily + weekly averages,
 * detect deficiencies, and optionally generate a Gemini summary.
 */
const getWeeklyReport = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Date range: last 7 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // ---- Build daily breakdown ----
    const dailyBreakdown = {};

    for (const meal of meals) {
      const dayKey = meal.date.toISOString().split('T')[0];
      if (!dailyBreakdown[dayKey]) {
        dailyBreakdown[dayKey] = {
          date: dayKey,
          calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0,
          totalCost: 0, mealCount: 0,
        };
      }
      dailyBreakdown[dayKey].calories  += meal.nutrients?.calories || 0;
      dailyBreakdown[dayKey].protein   += meal.nutrients?.protein || 0;
      dailyBreakdown[dayKey].carbs     += meal.nutrients?.carbs || 0;
      dailyBreakdown[dayKey].fat       += meal.nutrients?.fat || 0;
      dailyBreakdown[dayKey].iron      += meal.nutrients?.iron || 0;
      dailyBreakdown[dayKey].totalCost += meal.estimatedCost || 0;
      dailyBreakdown[dayKey].mealCount++;
    }

    const days = Object.values(dailyBreakdown);

    // ---- Calculate weekly averages ----
    const weeklyAverage = { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 };

    if (days.length > 0) {
      for (const day of days) {
        weeklyAverage.calories += day.calories;
        weeklyAverage.protein  += day.protein;
        weeklyAverage.carbs    += day.carbs;
        weeklyAverage.fat      += day.fat;
        weeklyAverage.iron     += day.iron;
      }
      for (const key of Object.keys(weeklyAverage)) {
        weeklyAverage[key] = Math.round(weeklyAverage[key] / days.length);
      }
    }

    // ---- Detect deficiencies based on the weekly average ----
    const recommended = getDailyRecommended(user);
    const deficiencies = detectDeficiencies(weeklyAverage, user);

    // ---- Smart snack suggestions ----
    const totalCost = days.reduce((sum, d) => sum + d.totalCost, 0);
    const avgDailyCost = days.length > 0 ? totalCost / days.length : 0;
    const remainingBudget = Math.max(0, user.dailyBudget - avgDailyCost);
    const suggestions = getSnackSuggestions(deficiencies, remainingBudget, user.foodPreference || 'veg');

    // ---- Compose the report ----
    const report = {
      user: {
        name: user.name,
        email: user.email,
        gender: user.gender,
        activityLevel: user.activityLevel,
        dailyBudget: user.dailyBudget,
        foodPreference: user.foodPreference,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysTracked: days.length,
        totalMeals: meals.length,
      },
      dailyBreakdown: days,
      averages: weeklyAverage,
      recommended,
      deficiencies,
      suggestions,
      totalWeeklyCost: Math.round(totalCost),
      avgDailyCost: Math.round(avgDailyCost),
    };

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('❌ Weekly report error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating report.' });
  }
};

/**
 * GET /api/report/pdf
 * Generate and stream a professionally formatted PDF report.
 */
const downloadPdf = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Gather the same data as the weekly report
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Build daily breakdown (same logic as above)
    const dailyBreakdown = {};
    for (const meal of meals) {
      const dayKey = meal.date.toISOString().split('T')[0];
      if (!dailyBreakdown[dayKey]) {
        dailyBreakdown[dayKey] = { date: dayKey, calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0, totalCost: 0 };
      }
      dailyBreakdown[dayKey].calories  += meal.nutrients?.calories || 0;
      dailyBreakdown[dayKey].protein   += meal.nutrients?.protein || 0;
      dailyBreakdown[dayKey].carbs     += meal.nutrients?.carbs || 0;
      dailyBreakdown[dayKey].fat       += meal.nutrients?.fat || 0;
      dailyBreakdown[dayKey].iron      += meal.nutrients?.iron || 0;
      dailyBreakdown[dayKey].totalCost += meal.estimatedCost || 0;
    }

    const days = Object.values(dailyBreakdown);
    const weeklyAverage = { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 };
    if (days.length > 0) {
      for (const day of days) {
        weeklyAverage.calories += day.calories;
        weeklyAverage.protein  += day.protein;
        weeklyAverage.carbs    += day.carbs;
        weeklyAverage.fat      += day.fat;
        weeklyAverage.iron     += day.iron;
      }
      for (const key of Object.keys(weeklyAverage)) {
        weeklyAverage[key] = Math.round(weeklyAverage[key] / days.length);
      }
    }

    const deficiencies = detectDeficiencies(weeklyAverage, user);
    const totalCost = days.reduce((sum, d) => sum + d.totalCost, 0);
    const avgDailyCost = days.length > 0 ? totalCost / days.length : 0;
    const remainingBudget = Math.max(0, user.dailyBudget - avgDailyCost);
    const suggestions = getSnackSuggestions(deficiencies, remainingBudget, user.foodPreference || 'veg');

    // Generate the PDF and pipe to the response
    const doc = generateReport(
      { name: user.name, age: user.age, gender: user.gender, dailyBudget: user.dailyBudget, foodPreference: user.foodPreference, activityLevel: user.activityLevel },
      { dailyBreakdown: days, averages: weeklyAverage },
      deficiencies,
      suggestions
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=weekly-nutrition-report.pdf');

    // pdfGenerator already calls doc.end(), so just pipe
    doc.pipe(res);
  } catch (error) {
    console.error('❌ PDF download error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating PDF.' });
  }
};

/**
 * GET /api/report/alerts
 * Return aggregated health and budget alerts for the authenticated user.
 */
const getAlerts = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const alerts = await getLoginAlerts(user._id);

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('❌ Alerts error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching alerts.' });
  }
};

module.exports = { getWeeklyReport, downloadPdf, getAlerts };

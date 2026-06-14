const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addMeal, getTodayMeals, getMealHistory, deleteMeal } = require('../controllers/mealController');

/**
 * Meal Routes
 * All routes require a valid Firebase ID token in the Authorization header.
 */

// POST /api/meals/add — Log a new meal
router.post('/add', authMiddleware, addMeal);

// GET /api/meals/today — Fetch today's meals with daily totals
router.get('/today', authMiddleware, getTodayMeals);

// GET /api/meals/history?startDate=...&endDate=... — Fetch meals in a date range
router.get('/history', authMiddleware, getMealHistory);

// DELETE /api/meals/:id — Delete a specific meal
router.delete('/:id', authMiddleware, deleteMeal);

module.exports = router;

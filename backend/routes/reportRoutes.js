const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getWeeklyReport, downloadPdf, getAlerts } = require('../controllers/reportController');

/**
 * Report Routes
 * All routes require a valid Firebase ID token.
 */

// GET /api/report/weekly — JSON weekly nutrition report
router.get('/weekly', authMiddleware, getWeeklyReport);

// GET /api/report/pdf — Download weekly report as PDF
router.get('/pdf', authMiddleware, downloadPdf);

// GET /api/report/alerts — Health and budget alerts
router.get('/alerts', authMiddleware, getAlerts);

module.exports = router;

const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeText, analyzeImage } = require('../controllers/aiController');

/**
 * AI Routes
 * Endpoints for Gemini-powered food analysis.
 * All routes require a valid Firebase ID token.
 */

// Configure multer to store uploads in memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10 MB per image
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// POST /api/ai/analyze-text — Analyze food from a text description
router.post('/analyze-text', authMiddleware, analyzeText);

// POST /api/ai/analyze-image — Analyze food from an uploaded photo
router.post('/analyze-image', authMiddleware, upload.single('image'), analyzeImage);

module.exports = router;

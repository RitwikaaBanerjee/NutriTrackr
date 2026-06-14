const { analyzeTextMeal, analyzeImageMeal } = require('../services/geminiService');

/**
 * AI Controller
 *
 * Exposes endpoints that use Gemini AI to analyze food
 * from text descriptions or uploaded images.
 */

/**
 * POST /api/ai/analyze-text
 * Body: { foodText: "2 chapati, dal, rice" }
 * Returns estimated nutrient breakdown.
 */
const analyzeText = async (req, res) => {
  try {
    const { foodText } = req.body;

    if (!foodText || foodText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'foodText is required. Describe what you ate.',
      });
    }

    const nutrients = await analyzeTextMeal(foodText);

    return res.status(200).json({
      success: true,
      data: nutrients,
    });
  } catch (error) {
    console.error('❌ AI text analysis error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze food text.',
    });
  }
};

/**
 * POST /api/ai/analyze-image
 * Multipart form-data with a single file field named "image".
 * Returns estimated nutrient breakdown from the food photo.
 */
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Use field name "image".',
      });
    }

    const { buffer, mimetype } = req.file;
    const nutrients = await analyzeImageMeal(buffer, mimetype);

    return res.status(200).json({
      success: true,
      data: nutrients,
    });
  } catch (error) {
    console.error('❌ AI image analysis error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze food image.',
    });
  }
};

module.exports = { analyzeText, analyzeImage };

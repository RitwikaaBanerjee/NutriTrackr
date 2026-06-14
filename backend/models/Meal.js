const mongoose = require('mongoose');

/**
 * Meal Schema
 * Stores individual meal entries with nutritional data and cost.
 * Each meal belongs to a user and is categorized by type and date.
 */
const mealSchema = new mongoose.Schema(
  {
    // Reference to the User who logged this meal
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The calendar date of the meal (time component is zeroed out for grouping)
    date: {
      type: Date,
      required: true,
    },

    // Meal category
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },

    // Text description of what was eaten
    description: {
      type: String,
      required: true,
    },

    // Optional image URL (if the user uploaded a food photo)
    imageUrl: {
      type: String,
    },

    // Nutritional breakdown — populated by Gemini AI analysis
    nutrients: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },  // grams
      carbs: { type: Number, default: 0 },     // grams
      fat: { type: Number, default: 0 },       // grams
      iron: { type: Number, default: 0 },      // milligrams
    },

    // Estimated cost in Indian Rupees
    estimatedCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries: "all meals for a user, newest first"
mealSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);

const mongoose = require('mongoose');

/**
 * User Schema
 * Stores profile information, dietary preferences, and budget.
 * Linked to Firebase Auth via firebaseUid.
 */
const userSchema = new mongoose.Schema(
  {
    // Firebase Auth UID — the primary link between our DB and Firebase
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },

    // Basic info from Firebase Auth
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },

    // Health-relevant demographics
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      type: Number, // in centimeters
    },
    weight: {
      type: Number, // in kilograms
    },

    // Used to adjust recommended daily nutrient values
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },

    // Daily food budget in Indian Rupees
    dailyBudget: {
      type: Number,
      default: 150,
    },

    // Dietary preference — used to filter snack suggestions
    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan'],
      default: 'veg',
    },

    // Flag set to true once the user fills out key profile fields
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);

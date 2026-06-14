const User = require('../models/User');

/**
 * Auth Controller
 *
 * Handles user registration, profile retrieval, and profile updates.
 * All routes expect req.user.uid (set by authMiddleware).
 */

/**
 * POST /api/auth/register
 * Create a new user record or update an existing one.
 * Called on first login (or every login) to keep the DB in sync with Firebase.
 */
const registerOrUpdate = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { name, age, gender, height, weight, activityLevel, dailyBudget, foodPreference } = req.body;

    // Try to find an existing user by Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // Update existing user with any new fields provided
      if (name !== undefined)           user.name = name;
      if (age !== undefined)            user.age = age;
      if (gender !== undefined)         user.gender = gender;
      if (height !== undefined)         user.height = height;
      if (weight !== undefined)         user.weight = weight;
      if (activityLevel !== undefined)  user.activityLevel = activityLevel;
      if (dailyBudget !== undefined)    user.dailyBudget = dailyBudget;
      if (foodPreference !== undefined) user.foodPreference = foodPreference;

      user.email = email; // Always keep email in sync with Firebase
      await user.save();
      console.log(`👤 User updated: ${email}`);
    } else {
      // Create a brand-new user record
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || '',
        age,
        gender,
        height,
        weight,
        activityLevel,
        dailyBudget,
        foodPreference,
      });
      console.log(`👤 New user registered: ${email}`);
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Register/Update error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * GET /api/auth/profile
 * Retrieve the current user's profile from MongoDB.
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found. Please complete registration.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

/**
 * PUT /api/auth/profile
 * Update the current user's profile fields.
 * Automatically marks profileCompleted=true when key fields are present.
 */
const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, height, weight, activityLevel, dailyBudget, foodPreference } = req.body;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Apply updates (only for fields that were actually sent)
    if (name !== undefined)           user.name = name;
    if (age !== undefined)            user.age = age;
    if (gender !== undefined)         user.gender = gender;
    if (height !== undefined)         user.height = height;
    if (weight !== undefined)         user.weight = weight;
    if (activityLevel !== undefined)  user.activityLevel = activityLevel;
    if (dailyBudget !== undefined)    user.dailyBudget = dailyBudget;
    if (foodPreference !== undefined) user.foodPreference = foodPreference;

    // Mark profile as complete if the essential fields are filled
    if (user.name && user.age && user.gender && user.height && user.weight) {
      user.profileCompleted = true;
    }

    await user.save();

    console.log(`👤 Profile updated: ${user.email}`);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

module.exports = { registerOrUpdate, getProfile, updateProfile };

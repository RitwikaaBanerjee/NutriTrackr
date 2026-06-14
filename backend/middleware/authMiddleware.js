const admin = require('../config/firebase');

/**
 * Authentication Middleware
 *
 * Verifies the Firebase ID token sent in the Authorization header.
 * On success, attaches the decoded user info (uid, email) to req.user
 * so downstream controllers can identify the caller.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Expect header format: "Authorization: Bearer <firebase-id-token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Extract the token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach decoded user info for controllers to use
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next(); // Token is valid — proceed to the route handler
  } catch (error) {
    console.error('🔒 Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

module.exports = authMiddleware;

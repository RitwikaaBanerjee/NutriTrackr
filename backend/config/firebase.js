const admin = require('firebase-admin');

// Check if credentials are placeholders or missing
const isMock = !process.env.FIREBASE_PROJECT_ID || 
               process.env.FIREBASE_PROJECT_ID === 'your-project-id' ||
               !process.env.FIREBASE_PRIVATE_KEY || 
               process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE') ||
               process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_KEY_HERE');

let adminInstance;

if (isMock) {
  console.log('⚠️ Running Firebase in MOCK mode (No valid credentials found in .env)');
  adminInstance = {
    auth: () => ({
      verifyIdToken: async (token) => {
        if (token === 'mock-token-12345') {
          return { uid: 'mock-uid-12345', email: 'demo-student@hostel.edu' };
        }
        throw new Error('Invalid mock token');
      }
    })
  };
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newline characters with actual newlines
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
    adminInstance = admin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK, falling back to mock mode:', error.message);
    adminInstance = {
      auth: () => ({
        verifyIdToken: async (token) => {
          if (token === 'mock-token-12345') {
            return { uid: 'mock-uid-12345', email: 'demo-student@hostel.edu' };
          }
          throw new Error('Invalid mock token');
        }
      })
    };
  }
}

module.exports = adminInstance;

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isMock = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key';

let app;
let auth;
let googleProvider;

if (isMock) {
  console.log('⚠️ Running Firebase Client in MOCK mode (Using demo authentication)');
  app = {};
  auth = {
    currentUser: null,
  };
  googleProvider = {};
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error('❌ Firebase Client Init error, falling back to mock:', error);
    app = {};
    auth = { currentUser: null };
    googleProvider = {};
  }
}

export { auth, googleProvider, isMock };
export default app;

/**
 * Authentication Context
 *
 * Provides Firebase Auth state and methods to the entire app.
 * On auth state change, registers/syncs the user with our backend.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isMock } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (isMock) {
      const storedUser = localStorage.getItem('mock_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Sync user with backend
        axios.post(
          `${API_URL}/auth/register`,
          { email: parsed.email, name: parsed.displayName || '' },
          { headers: { Authorization: `Bearer mock-token-12345` } }
        ).catch(err => console.error('Mock backend sync error:', err.message));
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Sync user with our backend (create or update)
        try {
          const token = await firebaseUser.getIdToken();
          await axios.post(
            `${API_URL}/auth/register`,
            { email: firebaseUser.email, name: firebaseUser.displayName || '' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error('Backend sync error:', err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signup = (email, password) => {
    if (isMock) {
      const mockUser = { uid: 'mock-uid-12345', email, displayName: email.split('@')[0] };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with email and password
  const login = (email, password) => {
    if (isMock) {
      const mockUser = { uid: 'mock-uid-12345', email, displayName: email.split('@')[0] };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google popup
  const googleLogin = () => {
    if (isMock) {
      const mockUser = { uid: 'mock-uid-12345', email: 'demo-student@hostel.edu', displayName: 'Demo Student' };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }
    return signInWithPopup(auth, googleProvider);
  };

  // Sign out
  const logout = () => {
    if (isMock) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  // Get the current user's Firebase ID token for API calls
  const getToken = async () => {
    if (isMock) {
      return 'mock-token-12345';
    }
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value = { user, loading, signup, login, googleLogin, logout, getToken };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * App — Root component
 *
 * Sets up authentication context, routing, and toast notifications.
 * Protected routes are wrapped with ProtectedRoute (auth + layout).
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — wrapped with auth check + Navbar layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-meal" element={<AddMeal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications — light frosted glass theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            color: '#18181b',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </AuthProvider>
  );
}

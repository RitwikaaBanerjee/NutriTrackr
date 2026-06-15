/**
 * ProtectedRoute — Route guard that requires authentication.
 * Wraps protected pages with the Navbar layout and animated background.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Still determining auth state
  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated → render layout with animated background + Navbar + child routes
  return (
    <div className="min-h-screen relative"
         style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 30%, #eef2ff 60%, #fdf4ff 100%)' }}>
      <AnimatedBackground />
      <Navbar />
      {/* Main content area with top padding for fixed navbar */}
      <main className="relative pt-20 px-4 pb-8 max-w-7xl mx-auto" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

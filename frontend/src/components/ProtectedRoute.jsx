/**
 * ProtectedRoute — Route guard that requires authentication.
 * Wraps protected pages with the Navbar layout.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Navbar from './Navbar';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Still determining auth state
  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated → render layout with Navbar + child routes
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <Navbar />
      {/* Main content area with top padding for fixed navbar */}
      <main className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

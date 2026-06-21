/**
 * ProtectedRoute — Route guard that requires authentication.
 * Wraps protected pages with the Navbar layout and a clean background.
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

  // Authenticated → render layout with clean background + Navbar + child routes
  return (
    <div className="min-h-screen relative"
         style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #f8fafc 25%, #eef2ff 55%, #faf5ff 85%, #fff7ed 100%)' }}>
      
      {/* Subtle ambient gradient blobs — CSS only, no distracting particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[35%] right-[10%] w-[400px] h-[400px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.04) 0%, transparent 70%)' }} />
      </div>

      <Navbar />
      {/* 
        Main content area with top padding for fixed navbar.
        Individual pages (Dashboard, Profile, etc.) handle their own max-width and margins.
      */}
      <main className="relative pt-[72px]" style={{ zIndex: 1, minHeight: 'calc(100vh - 72px)' }}>
        <Outlet />
      </main>
    </div>
  );
}

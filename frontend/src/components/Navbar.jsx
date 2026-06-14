/**
 * Navbar — Premium glassmorphism navigation bar
 * Fixed top, responsive with mobile hamburger menu.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Nav items configuration
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/add-meal', label: 'Add Meal', icon: PlusCircle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  // Styling for active vs inactive nav links
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-500/20 text-indigo-400'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ─── Logo ─── */}
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="gradient-text text-xl font-bold tracking-tight">
            NutriTrack
          </span>
        </NavLink>

        {/* ─── Desktop Navigation ─── */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* ─── User Info & Logout (Desktop) ─── */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-gray-400 text-sm truncate max-w-[160px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* ─── Mobile Hamburger ─── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ─── Mobile Menu (slide-down) ─── */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10 animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
              <p className="text-gray-500 text-xs px-3 mb-2 truncate">
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

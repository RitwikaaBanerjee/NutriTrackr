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
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/15'
        : 'text-zinc-500 border border-transparent hover:text-zinc-900 hover:bg-zinc-100/50'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-200/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ─── Logo ─── */}
        <NavLink to="/dashboard" className="flex items-center gap-1.5 group">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-indigo-600 text-sm group-hover:scale-105 transition-transform duration-300">
            🥗
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900 font-display">
            NutriTrack<span className="text-indigo-600 font-extrabold">.</span>
          </span>
        </NavLink>

        {/* ─── Desktop Navigation ─── */}
        <div className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* ─── User Info & Logout (Desktop) ─── */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-zinc-600 text-xs font-semibold bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg max-w-[180px] truncate">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-zinc-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 border border-transparent transition-all duration-200 cursor-pointer"
          >
            <LogOut size={14} />
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
        <div className="md:hidden glass border-t border-zinc-200/40 animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="border-t border-zinc-200/40 pt-3 mt-3">
              <p className="text-zinc-500 text-xs px-3 mb-2 truncate font-semibold">
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 hover:border-rose-100 border border-transparent w-full transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

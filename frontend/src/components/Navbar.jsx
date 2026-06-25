/**
 * Navbar — Premium frosted-glass navigation bar
 * Fixed top, responsive with mobile hamburger menu.
 * Taller with better spacing for a professional feel.
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
    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
      ? 'text-emerald-700 border border-emerald-500/15'
      : 'text-zinc-500 border border-transparent hover:text-zinc-800 hover:bg-white/50'
    }`;

  const activeBg = ({ isActive }) => ({
    background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
  });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(30px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(30px) saturate(1.6)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* ─── Logo ─── */}
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg group-hover:scale-105 transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #818cf8 100%)',
              boxShadow: '0 4px 14px rgba(52,211,153,0.3)',
            }}
          >
            🍽️
          </span>
          <span className="text-xl font-bold tracking-tight font-display" style={{ color: '#18181b' }}>
            Nutri<span style={{
              background: 'linear-gradient(135deg, #059669, #0891b2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Track</span>
          </span>
        </NavLink>

        {/* ─── Desktop Navigation ─── */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} style={activeBg}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* ─── User Info & Logout (Desktop) ─── */}
        <div className="hidden md:flex items-center gap-4">
          <span
            className="text-xs font-semibold px-3.5 py-2 rounded-lg max-w-[200px] truncate"
            style={{
              color: '#52525b',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              color: '#71717a',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = 'rgba(254,226,226,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#71717a';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* ─── Mobile Hamburger ─── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 rounded-xl transition-colors cursor-pointer"
          style={{ color: '#52525b' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileOpen && (
        <div
          className="md:hidden animate-slide-in"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="px-5 py-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                style={activeBg}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <p className="text-xs px-3 mb-3 truncate font-semibold" style={{ color: '#71717a' }}>
                {user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm w-full transition-all cursor-pointer"
                style={{ color: '#dc2626' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

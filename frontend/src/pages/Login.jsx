/**
 * Login Page
 *
 * Stunning dark-themed login with glassmorphism, floating food emojis,
 * and support for Email/Password + Google sign-in.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

// Floating food emojis for background animation
const floatingItems = [
  { emoji: '🍕', top: '10%', left: '10%', delay: '0s', size: 'text-4xl' },
  { emoji: '🥗', top: '20%', right: '15%', delay: '1s', size: 'text-3xl' },
  { emoji: '🍎', bottom: '30%', left: '8%', delay: '2s', size: 'text-3xl' },
  { emoji: '🥚', top: '60%', right: '10%', delay: '0.5s', size: 'text-4xl' },
  { emoji: '🍌', bottom: '15%', left: '20%', delay: '1.5s', size: 'text-3xl' },
  { emoji: '🍛', top: '40%', left: '5%', delay: '3s', size: 'text-2xl' },
  { emoji: '☕', bottom: '10%', right: '20%', delay: '2.5s', size: 'text-3xl' },
  { emoji: '🥑', top: '15%', left: '40%', delay: '4s', size: 'text-2xl' },
];

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Handle email/password submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
        toast.success('Account created! Welcome to NutriTrack 🎉');
      } else {
        await login(email, password);
        toast.success('Welcome back! 👋');
      }
      navigate('/dashboard');
    } catch (error) {
      const msg = error.code === 'auth/user-not-found'
        ? 'No account found. Try signing up!'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/email-already-in-use'
        ? 'Email already registered. Try signing in!'
        : error.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      toast.success('Welcome! 🎉');
      navigate('/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#f8f9fa]">
      {/* ─── Premium Ambient Glows (Light Mode) ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-500/[0.05] rounded-full blur-[140px] pointer-events-none select-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none select-none" />

      {/* Dotted background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* ─── Login Card ─── */}
      <div className="glass rounded-2xl border border-zinc-200/50 p-8 w-full max-w-md shadow-xl relative z-10 backdrop-blur-3xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4 shadow-sm">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight mb-1">NutriTrack</h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Smart Hostel Nutrition & Health Monitoring
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : (
              <>
                <LogIn size={16} />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <p className="text-center text-zinc-500 text-sm mb-6 font-medium">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        {/* Google Sign-In */}
        <button
          id="google-login"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {/* Google Icon SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

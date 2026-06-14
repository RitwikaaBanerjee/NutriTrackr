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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* ─── Floating Food Emojis ─── */}
      {floatingItems.map((item, i) => (
        <span
          key={i}
          className={`absolute ${item.size} opacity-20 animate-float select-none pointer-events-none`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            animationDelay: item.delay,
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* ─── Login Card ─── */}
      <div className="glass rounded-3xl p-8 w-full max-w-md animate-fade-in relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="gradient-text text-4xl font-bold mb-2">NutriTrack</h1>
          <p className="text-gray-400 text-sm">
            Smart Hostel Nutrition Monitoring
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 text-sm transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 text-sm transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <p className="text-center text-gray-400 text-sm mb-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Sign-In */}
        <button
          id="google-login"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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

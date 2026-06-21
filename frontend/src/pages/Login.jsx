/**
 * Login Page — Pixel-perfect match of the reference design
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── Inline SVG icons ── */
const LeafLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="#059669" />
    <path d="M12 6c-3.314 0-6 2.686-6 6 0 1.95 1.054 3.73 2.7 4.8.4-.6 1-1 1.7-1.1-1.3-.9-2.2-2.3-2.2-3.9 0-2.6 2.1-4.7 4.7-4.7 1 0 1.9.3 2.7.8.3-.3.7-.6 1.1-.8C15.5 6.4 13.8 6 12 6z" fill="#fff" />
    <path d="M14.5 9c-1.38 0-2.5 1.12-2.5 2.5 0 1.1.72 2.05 1.7 2.37.16.53.44 1.02.8 1.43V17h1v-1.63c1.33-1.07 2-2.73 2-4.37C17.5 10.12 16.38 9 14.5 9z" fill="#fff" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="11" x="4" y="11" rx="2.5" ry="2.5" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="m1 1 22 22" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const BrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
  </svg>
);
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      if (isSignUp) { await signup(email, password); toast.success('Account created!'); }
      else { await login(email, password); toast.success('Welcome back!'); }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try { await googleLogin(); navigate('/dashboard'); }
    catch (error) { if (error.code !== 'auth/popup-closed-by-user') toast.error('Google sign-in failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
      {/* ── Main Container ── */}
      <div
        className="w-full max-w-[1160px] bg-white rounded-[36px] overflow-hidden flex flex-col lg:flex-row relative"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.06)', minHeight: '740px' }}
      >

        {/* ═══════  LEFT PANEL  ═══════ */}
        <div
          className="lg:w-[48%] flex flex-col justify-between p-8 lg:p-12 bg-[#f0f9f4] relative overflow-hidden shrink-0"

        >

          <div className="relative z-10">
            {/* ── Brand ── */}
            <div className="flex items-center gap-3.5 mb-14">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#059669' }}>
                <LeafLogo />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[26px] font-bold text-zinc-900 tracking-tight leading-none mb-1.5">
                  Nutri<span className="text-[#059669]">Trackr</span>
                </span>
                <span className="text-[13px] font-medium text-zinc-500 leading-none">
                  Track Smart. Eat Better. Live Healthy.
                </span>
              </div>
            </div>

            {/* ── Copy ── */}
            <h2 className="text-[42px] font-bold tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)', lineHeight: '1.2' }}>
              <span className="text-[#059669]">Smart Nutrition</span><br />
              <span className="text-zinc-800">for Hostel Life</span>
            </h2>
            <p className="text-[17px] leading-[1.6] text-zinc-500 max-w-[380px] font-medium">
              Track your meals, monitor nutrients, get AI-powered insights and stay healthy on a student budget.
            </p>
          </div>

          {/* ── Image ── */}
          <div className="flex-1 w-full flex items-center justify-center relative z-0 mt-8 mb-6 min-h-[250px]">
            <img
              src="/hero-nutrition.png"
              alt="Nutrition Mockup"
              className="w-full max-w-[440px] h-full object-contain drop-shadow-xl"
            />
          </div>

          {/* ── Feature Pills ── */}
          <div className="relative z-10 mt-auto w-full flex justify-center">
            <div className="inline-flex items-center justify-center gap-6 sm:gap-10 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full shadow-sm border border-white w-full max-w-[480px]">
              <div className="flex items-center gap-2">
                <BrainIcon />
                <span className="text-[13px] font-semibold text-zinc-700">AI Meal Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartIcon />
                <span className="text-[13px] font-semibold text-zinc-700">Health Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <WalletIcon />
                <span className="text-[13px] font-semibold text-zinc-700">Budget Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════  RIGHT PANEL  ═══════ */}
        <div
          className="lg:w-[52%] flex items-center justify-center bg-white relative p-8"
          style={{ padding: '32px' }}
        >

          {/* ── "New here? Sign up" Top-Right Button ── */}
          <div className="absolute top-8 right-8 z-20">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
            >
              <span className="text-[13px] font-semibold text-zinc-500">{isSignUp ? 'Already have an account?' : 'New here?'}</span>
              <span className="text-[13px] font-bold text-[#059669]">{isSignUp ? 'Sign in' : 'Sign up'}</span>
            </button>
          </div>

          {/* ── Form Container ── */}
          <div className="w-full max-w-[420px]">

            {/* Icon & Welcome */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-[#eaf6ef] rounded-[20px] flex items-center justify-center mb-6 shadow-[0_4px_20px_rgba(5,150,105,0.08)]">
                <span className="text-[30px] leading-none">🥗</span>
              </div>
              <h3 className="text-[32px] font-extrabold text-zinc-900 tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {isSignUp ? 'Create Account' : 'Welcome Back!'}
              </h3>
              <p className="text-[15px] font-medium text-zinc-500">
                {isSignUp ? 'Sign up to start your health journey' : 'Login to continue your health journey'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="relative">
                <span className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none"><MailIcon /></span>
                <input
                  type="email" placeholder="Email address"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-[52px] pr-4 h-[56px] rounded-[16px] border border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all"
                  style={{ paddingLeft: '52px' }}
                />
              </div>

              <div className="relative">
                <span className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none"><LockIcon /></span>
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-[52px] pr-[52px] h-[56px] rounded-[16px] border border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all"
                  style={{ paddingLeft: '52px' }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors h-full flex items-center">
                  {showPw ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>

              {!isSignUp && (
                <div className="flex justify-end -mt-2">
                  <button type="button" className="text-[13px] font-bold text-[#059669] hover:text-[#047857] transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full h-[56px] rounded-[16px] text-white text-[16px] font-bold flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)', boxShadow: '0 8px 25px rgba(5,150,105,0.25)' }}
              >
                {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRightIcon /> {isSignUp ? 'Create Account' : 'Login'}</>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-[12px] font-medium text-zinc-400">or</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin} disabled={loading}
              className="w-full h-[56px] rounded-[16px] border border-zinc-200 bg-white text-[15px] font-bold text-zinc-700 flex items-center justify-center gap-3 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
            >
              <GoogleIcon /> Continue with Google
            </button>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[13px] font-medium text-zinc-500">
              <ShieldCheckIcon /> Your data is secure and protected
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


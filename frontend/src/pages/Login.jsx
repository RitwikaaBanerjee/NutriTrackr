/**
 * Login Page
 *
 * Premium login with interactive canvas food-particle background
 * that responds to cursor movement, frosted-glass card, and smooth animations.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Food items drawn on the canvas ── */
const FOOD_EMOJIS = [
  '🍎', '🥑', '🥦', '🍊', '🥕', '🍇', '🍌', '🥗',
  '🍕', '🍛', '☕', '🥚', '🍓', '🥝', '🌽', '🍋',
  '🫐', '🥒', '🍑', '🧀', '🍅', '🥭', '🍍', '🥥',
];

function createParticles(width, height, count = 32) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 22 + Math.random() * 20,
    emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.4,
    parallaxFactor: 0.02 + Math.random() * 0.04, // how much cursor affects it
    opacity: 0.45 + Math.random() * 0.35,
  }));
}

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const { user, login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  /* ── Canvas refs ── */
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ── Interactive Canvas Background ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, width, height);

    particlesRef.current.forEach((p) => {
      // Mouse repulsion: push particles gently away from cursor
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulseRadius = 150;

      if (dist < repulseRadius && dist > 0) {
        const force = (repulseRadius - dist) / repulseRadius;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
      }

      // Parallax offset based on cursor position
      const offsetX = (mouse.x - width / 2) * p.parallaxFactor;
      const offsetY = (mouse.y - height / 2) * p.parallaxFactor;

      // Update physics
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Wrap around screen edges
      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;
      if (p.y < -50) p.y = height + 50;
      if (p.y > height + 50) p.y = -50;

      // Draw
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + offsetX, p.y + offsetY);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = createParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouch, { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  /* ── Form Handlers ── */
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 30%, #eef2ff 60%, #fdf4ff 100%)' }}>

      {/* ── Interactive Canvas (food particles) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* ── Soft ambient gradient blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)' }} />

      {/* ── Login Card ── */}
      <div
        className="relative z-10 w-full max-w-[420px]"
        style={{
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          {/* ── Branding ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
                 style={{
                   background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #818cf8 100%)',
                   boxShadow: '0 8px 24px rgba(52,211,153,0.3)',
                 }}>
              <span className="text-3xl drop-shadow-sm">🍽️</span>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
                <Sparkles size={11} className="text-amber-500" />
              </div>
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight mb-1.5"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NutriTrack
            </h1>
            <p style={{ color: '#71717a', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Smart Hostel Nutrition Monitoring
            </p>
          </div>

          {/* ── Email / Password Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5 mb-5">
            {/* Email */}
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: '#a1a1aa' }}
              />
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  background: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem',
                  color: '#18181b',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.4)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255,255,255,0.8)';
                }}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: '#a1a1aa' }}
              />
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  background: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem',
                  color: '#18181b',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.4)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.06)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255,255,255,0.8)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="cursor-pointer"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                backgroundSize: '200% 200%',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 6px 20px rgba(5,150,105,0.25)',
                opacity: loading ? 0.6 : 1,
                animation: 'gradientShift 4s ease-in-out infinite',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(5,150,105,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.25)';
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                  Please wait...
                </span>
              ) : (
                <>
                  {isSignUp ? <LogIn size={16} /> : <ArrowRight size={16} />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <p className="text-center text-sm mb-5" style={{ color: '#71717a', fontWeight: 500 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="cursor-pointer"
              style={{
                color: '#059669',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                fontSize: 'inherit',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#047857')}
              onMouseLeave={(e) => (e.target.style.color = '#059669')}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent)' }} />
            <span style={{ color: '#a1a1aa', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
            <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent)' }} />
          </div>

          {/* Google Sign-In */}
          <button
            id="google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="cursor-pointer"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              border: '1.5px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#3f3f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.25s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* ── Bottom tagline ── */}
        <p className="text-center mt-5" style={{ color: '#a1a1aa', fontSize: '0.72rem', fontWeight: 500 }}>
          Track smarter · Eat better · Live healthier
        </p>
      </div>
    </div>
  );
}

/**
 * AnimatedBackground — Shared interactive food particle canvas
 * 
 * Renders floating food emojis that respond to cursor movement.
 * Used as a background layer across all pages for visual consistency.
 * Uses fewer, smaller, more transparent particles than the login page
 * so it doesn't distract from actual content.
 */
import { useEffect, useRef, useCallback } from 'react';

const FOOD_EMOJIS = [
  '🍎', '🥑', '🥦', '🍊', '🥕', '🍇', '🍌', '🥗',
  '🍕', '🍛', '☕', '🥚', '🍓', '🥝', '🌽', '🍋',
  '🫐', '🥒', '🍑', '🧀', '🍅', '🥭', '🍍', '🥥',
];

function createParticles(width, height, count = 18) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    size: 18 + Math.random() * 14,
    emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.25,
    parallaxFactor: 0.01 + Math.random() * 0.025,
    opacity: 0.18 + Math.random() * 0.15,
  }));
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, width, height);

    particlesRef.current.forEach((p) => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulseRadius = 120;

      if (dist < repulseRadius && dist > 0) {
        const force = (repulseRadius - dist) / repulseRadius;
        p.vx += (dx / dist) * force * 0.2;
        p.vy += (dy / dist) * force * 0.2;
      }

      const offsetX = (mouse.x - width / 2) * p.parallaxFactor;
      const offsetY = (mouse.y - height / 2) * p.parallaxFactor;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vx *= 0.99;
      p.vy *= 0.99;

      if (p.x < -40) p.x = width + 40;
      if (p.x > width + 40) p.x = -40;
      if (p.y < -40) p.y = height + 40;
      if (p.y > height + 40) p.y = -40;

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
      canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
      particlesRef.current = createParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };

    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY + window.scrollY };
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

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Soft ambient blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="fixed top-[40%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none select-none"
           style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.05) 0%, transparent 70%)', zIndex: 0 }} />
    </>
  );
}

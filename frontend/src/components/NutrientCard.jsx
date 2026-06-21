/**
 * NutrientCard — Displays a single nutrient with circular progress ring.
 * Color-coded by percentage of recommended daily value.
 * Designed for light-mode frosted glass background.
 */
import { useEffect, useState } from 'react';

export default function NutrientCard({ label, value = 0, recommended = 1, unit, icon: Icon }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const percentage = Math.min(Math.round((value / recommended) * 100), 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const ringColor = getColor();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col items-center gap-4 relative group transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)';
      }}
    >
      {/* Icon badge */}
      {Icon && (
        <div className="absolute top-4 right-4 transition-colors" style={{ color: '#c4c4cc' }}>
          <Icon size={18} />
        </div>
      )}

      {/* SVG Circular Progress Ring */}
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44" cy="44" r={radius}
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="5"
            fill="none"
          />
          <circle
            cx="44" cy="44" r={radius}
            stroke={ringColor}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#18181b' }}>{Math.round(value)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#71717a' }}>{unit}</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-bold tracking-wide uppercase" style={{ color: '#3f3f46' }}>{label}</p>

      {/* Target */}
      <p className="text-xs font-medium" style={{ color: '#a1a1aa' }}>
        Target: {recommended} {unit}
      </p>
    </div>
  );
}

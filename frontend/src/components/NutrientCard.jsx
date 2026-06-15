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
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center gap-3 relative group transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)';
      }}
    >
      {/* Icon badge */}
      {Icon && (
        <div className="absolute top-3.5 right-3.5 transition-colors" style={{ color: '#a1a1aa' }}>
          <Icon size={16} />
        </div>
      )}

      {/* SVG Circular Progress Ring */}
      <div className="relative w-20 h-20 mt-2">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="5"
            fill="none"
          />
          <circle
            cx="40" cy="40" r={radius}
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
          <span className="text-xl font-bold tracking-tight" style={{ color: '#18181b' }}>{Math.round(value)}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>{unit}</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold tracking-wider uppercase mt-1" style={{ color: '#52525b' }}>{label}</p>

      {/* Target */}
      <p className="text-[11px] font-medium" style={{ color: '#a1a1aa' }}>
        Target: {recommended} {unit}
      </p>
    </div>
  );
}

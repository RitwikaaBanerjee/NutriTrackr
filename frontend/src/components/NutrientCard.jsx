/**
 * NutrientCard — Displays a single nutrient with circular progress ring.
 * Color-coded by percentage of recommended daily value.
 *
 * Props: { label, value, recommended, unit, color, icon: Icon }
 */
import { useEffect, useState } from 'react';

export default function NutrientCard({ label, value = 0, recommended = 1, unit, color = '#6366f1', icon: Icon }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const percentage = Math.min(Math.round((value / recommended) * 100), 100);

  // Animate the progress ring on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Color coding based on intake percentage
  const getColor = () => {
    if (percentage >= 75) return '#10b981'; // Emerald — good
    if (percentage >= 50) return '#f59e0b'; // Amber — moderate
    return '#f43f5e';                        // Rose — low
  };

  const ringColor = getColor();
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className="glass glass-card-hover rounded-2xl p-5 flex flex-col items-center gap-3 relative group border border-white/5">
      {/* Icon badge */}
      {Icon && (
        <div className="absolute top-3.5 right-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors">
          <Icon size={16} />
        </div>
      )}

      {/* SVG Circular Progress Ring */}
      <div className="relative w-20 h-20 mt-2">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle
            cx="40" cy="40" r={radius}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="5"
            fill="none"
          />
          {/* Progress ring */}
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
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-zinc-900 tracking-tight">{Math.round(value)}</span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{unit}</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mt-2">{label}</p>

      {/* Value / Recommended */}
      <p className="text-[11px] text-zinc-500 font-medium">
        Target: {recommended} {unit}
      </p>
    </div>
  );
}

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
    if (percentage >= 75) return '#22c55e'; // Green — good
    if (percentage >= 50) return '#f59e0b'; // Yellow — moderate
    return '#ef4444';                        // Red — low
  };

  const ringColor = getColor();
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform duration-300 relative group">
      {/* Icon badge */}
      {Icon && (
        <div className="absolute top-3 right-3 text-gray-500 group-hover:text-gray-300 transition-colors">
          <Icon size={18} />
        </div>
      )}

      {/* SVG Circular Progress Ring */}
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle
            cx="40" cy="40" r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx="40" cy="40" r={radius}
            stroke={ringColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(value)}</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-300">{label}</p>

      {/* Value / Recommended */}
      <p className="text-xs text-gray-500">
        {Math.round(value)} / {recommended} {unit}
      </p>
    </div>
  );
}

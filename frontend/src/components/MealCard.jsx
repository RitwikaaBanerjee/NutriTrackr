/**
 * MealCard — Displays a single logged meal with nutrients and actions.
 * Color-coded meal type badge, nutrient pills, cost, and delete button.
 * Styled for light-mode frosted glass aesthetic.
 */
import { Trash2, Clock } from 'lucide-react';

const typeConfig = {
  breakfast: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', emoji: '☕', label: 'Breakfast' },
  lunch: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', emoji: '🍛', label: 'Lunch' },
  dinner: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', emoji: '🌙', label: 'Dinner' },
  snack: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', emoji: '🍪', label: 'Snack' },
};

const nutrientConfig = [
  { key: 'calories', label: 'Cal', unit: '', color: '#f97316' },
  { key: 'protein', label: 'Pro', unit: 'g', color: '#0ea5e9' },
  { key: 'carbs', label: 'Carb', unit: 'g', color: '#8b5cf6' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#f59e0b' },
  { key: 'iron', label: 'Iron', unit: 'mg', color: '#f43f5e' },
];

export default function MealCard({ meal, onDelete }) {
  const config = typeConfig[meal.mealType] || typeConfig.snack;
  const nutrients = meal.nutrients || {};

  const handleDelete = () => {
    if (window.confirm('Delete this meal entry?')) {
      onDelete(meal._id);
    }
  };

  const time = meal.createdAt
    ? new Date(meal.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className="rounded-2xl p-6 relative group transition-all duration-300"
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
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)';
      }}
    >
      {/* Header: meal type + time + delete */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold"
          style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}18` }}
        >
          {config.emoji} {config.label}
        </span>
        <div className="flex items-center gap-3">
          {time && (
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#a1a1aa' }}>
              <Clock size={13} />
              {time}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 cursor-pointer rounded-lg hover:bg-red-50"
            style={{ color: '#a1a1aa' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Food description */}
      <p className="text-sm font-semibold mb-4 leading-relaxed" style={{ color: '#27272a' }}>
        {meal.description}
      </p>

      {/* Nutrient pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {nutrientConfig.map(({ key, label, unit, color }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ color, background: `${color}0D`, border: `1px solid ${color}18` }}
          >
            {label}: {Math.round(nutrients[key] || 0)}{unit}
          </span>
        ))}
      </div>

      {/* Estimated cost */}
      {meal.estimatedCost > 0 && (
        <p className="text-xs font-medium pt-3" style={{ color: '#71717a', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          Estimated cost: <span className="font-bold" style={{ color: '#059669' }}>₹{meal.estimatedCost}</span>
        </p>
      )}
    </div>
  );
}

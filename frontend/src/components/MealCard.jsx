/**
 * MealCard — Displays a single logged meal with nutrients and actions.
 * Color-coded meal type badge, nutrient pills, cost, and delete button.
 *
 * Props: { meal, onDelete }
 */
import { Trash2, Clock } from 'lucide-react';

// Meal type → badge color mapping
const typeColors = {
  breakfast: 'bg-amber-50 text-amber-700 border-amber-200/50',
  lunch: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  dinner: 'bg-purple-50 text-purple-700 border-purple-200/50',
  snack: 'bg-sky-50 text-sky-700 border-sky-200/50',
};

// Meal type emoji
const typeEmoji = {
  breakfast: '☕',
  lunch: '🍛',
  dinner: '🌙',
  snack: '🍪',
};

export default function MealCard({ meal, onDelete }) {
  const colorClass = typeColors[meal.mealType] || typeColors.snack;
  const emoji = typeEmoji[meal.mealType] || '🍽️';
  const nutrients = meal.nutrients || {};

  const handleDelete = () => {
    if (window.confirm('Delete this meal entry?')) {
      onDelete(meal._id);
    }
  };

  const time = meal.createdAt
    ? new Date(meal.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="glass glass-card-hover rounded-2xl p-5 border border-white/5 relative group">
      {/* Header: meal type + time + delete */}
      <div className="flex items-center justify-between mb-3.5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${colorClass}`}>
          {emoji} {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)}
        </span>
        <div className="flex items-center gap-2">
          {time && (
            <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Clock size={12} />
              {time}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-all p-1 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Food description */}
      <p className="text-zinc-800 text-sm font-semibold mb-3.5 leading-relaxed">
        {meal.description}
      </p>

      {/* Nutrient pills */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        <NutrientPill label="Cal" value={nutrients.calories} unit="" color="text-orange-400 bg-orange-500/5 border border-orange-500/10" />
        <NutrientPill label="Pro" value={nutrients.protein} unit="g" color="text-sky-400 bg-sky-500/5 border border-sky-500/10" />
        <NutrientPill label="Carb" value={nutrients.carbs} unit="g" color="text-purple-400 bg-purple-500/5 border border-purple-500/10" />
        <NutrientPill label="Fat" value={nutrients.fat} unit="g" color="text-amber-400 bg-amber-500/5 border border-amber-500/10" />
        <NutrientPill label="Iron" value={nutrients.iron} unit="mg" color="text-rose-400 bg-rose-500/5 border border-rose-500/10" />
      </div>

      {/* Estimated cost */}
      {meal.estimatedCost > 0 && (
        <p className="text-[11px] text-zinc-500 font-medium">
          Estimated cost: <span className="text-emerald-400 font-semibold">₹{meal.estimatedCost}</span>
        </p>
      )}
    </div>
  );
}

/** Small pill component showing a nutrient value */
function NutrientPill({ label, value, unit, color }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${color}`}>
      {label}: {Math.round(value || 0)}{unit}
    </span>
  );
}

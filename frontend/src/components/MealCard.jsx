/**
 * MealCard — Displays a single logged meal with nutrients and actions.
 * Color-coded meal type badge, nutrient pills, cost, and delete button.
 *
 * Props: { meal, onDelete }
 */
import { Trash2, Clock } from 'lucide-react';

// Meal type → badge color mapping
const typeColors = {
  breakfast: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  lunch: 'bg-green-500/20 text-green-400 border-green-500/30',
  dinner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  snack: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
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

  // Format time from createdAt
  const time = meal.createdAt
    ? new Date(meal.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="glass rounded-2xl p-4 hover:-translate-y-1 transition-all duration-300 group">
      {/* Header: meal type + time + delete */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${colorClass}`}>
          {emoji} {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)}
        </span>
        <div className="flex items-center gap-2">
          {time && (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock size={12} />
              {time}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Food description */}
      <p className="text-gray-200 text-sm mb-3 leading-relaxed">
        {meal.description}
      </p>

      {/* Nutrient pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <NutrientPill label="Cal" value={nutrients.calories} unit="" color="text-orange-400 bg-orange-500/10" />
        <NutrientPill label="Pro" value={nutrients.protein} unit="g" color="text-blue-400 bg-blue-500/10" />
        <NutrientPill label="Carb" value={nutrients.carbs} unit="g" color="text-purple-400 bg-purple-500/10" />
        <NutrientPill label="Fat" value={nutrients.fat} unit="g" color="text-yellow-400 bg-yellow-500/10" />
        <NutrientPill label="Iron" value={nutrients.iron} unit="mg" color="text-red-400 bg-red-500/10" />
      </div>

      {/* Estimated cost */}
      {meal.estimatedCost > 0 && (
        <p className="text-xs text-gray-500">
          Estimated cost: <span className="text-green-400 font-medium">₹{meal.estimatedCost}</span>
        </p>
      )}
    </div>
  );
}

/** Small pill component showing a nutrient value */
function NutrientPill({ label, value, unit, color }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
      {label}: {Math.round(value || 0)}{unit}
    </span>
  );
}

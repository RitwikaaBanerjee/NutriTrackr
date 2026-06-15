/**
 * Dashboard Page
 *
 * Main hub showing today's nutrition summary, alerts, meals,
 * budget tracking, snack suggestions, and weekly trends.
 * Styled for premium light-mode frosted glass aesthetic.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import NutrientCard from '../components/NutrientCard';
import AlertBanner from '../components/AlertBanner';
import MealCard from '../components/MealCard';
import { Flame, Beef, Wheat, Droplets, PlusCircle, TrendingUp, Wallet, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

/* ── Shared frosted card style ── */
const card = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
  borderRadius: '18px',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 });
  const [recommended, setRecommended] = useState({ calories: 2200, protein: 55, carbs: 275, fat: 60, iron: 19 });
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, mealsRes, alertsRes, weeklyRes] = await Promise.allSettled([
        api.getProfile(),
        api.getTodayMeals(),
        api.getAlerts(),
        api.getWeeklyReport(),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data);
      if (mealsRes.status === 'fulfilled') {
        const data = mealsRes.value.data.data;
        setMeals(data.meals || []);
        setTotals(data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 });
        if (data.recommended) setRecommended(data.recommended);
      }
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.data || []);
      if (weeklyRes.status === 'fulfilled') {
        const report = weeklyRes.value.data.data;
        setWeeklyData(report?.dailyBreakdown || []);
        setSuggestions(report?.suggestions || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await api.deleteMeal(mealId);
      toast.success('Meal deleted');
      fetchDashboardData();
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  const handleDismissAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const budget = profile?.dailyBudget || 150;
  const spent = meals.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
  const budgetPercentage = Math.min(Math.round((spent / budget) * 100), 100);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded-xl w-64" style={{ background: 'rgba(0,0,0,0.04)' }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-40" style={{ ...card, opacity: 0.5 }} />
          ))}
        </div>
        <div className="rounded-2xl h-48" style={{ ...card, opacity: 0.5 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Greeting ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: '#18181b' }}>
            {getGreeting()}, {profile?.name || 'there'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          to="/add-meal"
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.2)',
          }}
        >
          <PlusCircle size={16} />
          Add Meal
        </Link>
      </div>

      {/* ─── Alerts ─── */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* ─── Nutrient Summary ─── */}
      <div>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
          <TrendingUp size={18} style={{ color: '#059669' }} />
          Today's Nutrition
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutrientCard label="Calories" value={totals.calories} recommended={recommended.calories} unit="kcal" icon={Flame} />
          <NutrientCard label="Protein" value={totals.protein} recommended={recommended.protein} unit="g" icon={Beef} />
          <NutrientCard label="Carbs" value={totals.carbs} recommended={recommended.carbs} unit="g" icon={Wheat} />
          <NutrientCard label="Fat" value={totals.fat} recommended={recommended.fat} unit="g" icon={Droplets} />
        </div>
      </div>

      {/* ─── Budget Tracker ─── */}
      <div className="rounded-2xl p-6 transition-all duration-300" style={card}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-semibold tracking-wider uppercase flex items-center gap-2" style={{ color: '#71717a' }}>
            <Wallet size={14} style={{ color: '#059669' }} />
            Daily Budget
          </h3>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ color: '#52525b', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            ₹{spent} / ₹{budget}
          </span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(budgetPercentage, 100)}%`,
              background: budgetPercentage > 100
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : budgetPercentage > 75
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #10b981, #059669)',
            }}
          />
        </div>
        {budgetPercentage > 100 && (
          <p className="text-xs font-medium mt-2.5" style={{ color: '#ef4444' }}>⚠ Budget exceeded by ₹{spent - budget}</p>
        )}
      </div>

      {/* ─── Today's Meals ─── */}
      <div>
        <h2 className="text-base font-bold mb-3 font-display" style={{ color: '#18181b' }}>
          Today's Meals ({meals.length})
        </h2>
        {meals.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={card}>
            <p className="text-sm mb-3" style={{ color: '#71717a' }}>No meals logged yet today 🍽️</p>
            <Link
              to="/add-meal"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#059669' }}
            >
              Log your first meal →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {meals.map((meal) => (
              <MealCard key={meal._id} meal={meal} onDelete={handleDeleteMeal} />
            ))}
          </div>
        )}
      </div>

      {/* ─── Smart Snack Suggestions ─── */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
            <Lightbulb size={18} style={{ color: '#f59e0b' }} />
            Smart Snack Suggestions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 transition-all duration-300"
                style={card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = card.boxShadow;
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-bold text-sm font-display" style={{ color: '#18181b' }}>{s.name}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{ color: '#059669', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.1)' }}
                  >
                    ₹{s.estimatedCost}
                  </span>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: '#71717a' }}>{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Weekly Trend Chart ─── */}
      {weeklyData.length > 0 && (
        <div className="rounded-2xl p-6" style={card}>
          <h2 className="text-base font-bold mb-5 flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
            <TrendingUp size={18} style={{ color: '#6366f1' }} />
            Weekly Calorie Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <XAxis
                dataKey="date"
                stroke="#a1a1aa"
                fontSize={12}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-IN', { weekday: 'short' });
                }}
              />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '12px',
                  color: '#18181b',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5, fill: '#818cf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

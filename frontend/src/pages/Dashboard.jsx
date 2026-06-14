/**
 * Dashboard Page
 *
 * Main hub showing today's nutrition summary, alerts, meals,
 * budget tracking, snack suggestions, and weekly trends.
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
      // Fetch all data in parallel
      const [profileRes, mealsRes, alertsRes, weeklyRes] = await Promise.allSettled([
        api.getProfile(),
        api.getTodayMeals(),
        api.getAlerts(),
        api.getWeeklyReport(),
      ]);

      // Profile
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data.data);
      }

      // Today's meals
      if (mealsRes.status === 'fulfilled') {
        const data = mealsRes.value.data.data;
        setMeals(data.meals || []);
        setTotals(data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, iron: 0 });
        if (data.recommended) setRecommended(data.recommended);
      }

      // Alerts
      if (alertsRes.status === 'fulfilled') {
        setAlerts(alertsRes.value.data.data || []);
      }

      // Weekly report (for chart + suggestions)
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

  // Handle meal deletion
  const handleDeleteMeal = async (mealId) => {
    try {
      await api.deleteMeal(mealId);
      toast.success('Meal deleted');
      fetchDashboardData(); // Refresh data
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  // Dismiss an alert
  const handleDismissAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Budget calculation
  const budget = profile?.dailyBudget || 150;
  const spent = meals.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
  const budgetPercentage = Math.min(Math.round((spent / budget) * 100), 100);
  const budgetColor = budgetPercentage > 100 ? 'bg-red-500' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-green-500';

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-xl w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-40" />
          ))}
        </div>
        <div className="glass rounded-2xl h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Greeting ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {profile?.name || 'there'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
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
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-[0.98]"
        >
          <PlusCircle size={16} />
          Add Meal
        </Link>
      </div>

      {/* ─── Alerts ─── */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* ─── Nutrient Summary ─── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-400" />
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
      <div className="glass glass-card-hover rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
            <Wallet size={14} className="text-emerald-400" />
            Daily Budget
          </h3>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
            ₹{spent} / ₹{budget}
          </span>
        </div>
        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${budgetColor === 'bg-green-500' ? 'bg-emerald-500' : budgetColor === 'bg-amber-500' ? 'bg-amber-500' : 'bg-rose-500'} transition-all duration-500`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        {budgetPercentage > 100 && (
          <p className="text-rose-400 text-xs font-medium mt-2.5">⚠ Budget exceeded by ₹{spent - budget}</p>
        )}
      </div>

      {/* ─── Today's Meals ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Today's Meals ({meals.length})
          </h2>
        </div>
        {meals.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center border border-white/5">
            <p className="text-zinc-400 text-sm mb-3">No meals logged yet today 🍽️</p>
            <Link
              to="/add-meal"
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold uppercase tracking-wider"
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
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-400" />
            Smart Snack Suggestions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s, i) => (
              <div key={i} className="glass glass-card-hover rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-zinc-900 font-bold text-sm font-display">{s.name}</span>
                  <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">₹{s.estimatedCost}</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed font-medium">{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Weekly Trend Chart ─── */}
      {weeklyData.length > 0 && (
        <div className="glass glass-card-hover rounded-2xl p-6 border border-white/5">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2 font-display">
            <TrendingUp size={18} className="text-indigo-400" />
            Weekly Calorie Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <XAxis
                dataKey="date"
                stroke="#4b5563"
                fontSize={12}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-IN', { weekday: 'short' });
                }}
              />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  color: '#f4f4f5',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5, fill: '#c084fc' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

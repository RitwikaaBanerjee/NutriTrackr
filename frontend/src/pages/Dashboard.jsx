/**
 * Dashboard Page
 *
 * Main hub showing today's nutrition summary, alerts, meals,
 * budget tracking, snack suggestions, and weekly trends.
 * Styled for premium light-mode frosted glass aesthetic with proper spacing.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import NutrientCard from '../components/NutrientCard';
import AlertBanner from '../components/AlertBanner';
import MealCard from '../components/MealCard';
import { Flame, Beef, Wheat, Droplets, PlusCircle, TrendingUp, Wallet, Lightbulb, UtensilsCrossed } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

/* ── Shared frosted card style ── */
const card = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
  borderRadius: '24px',
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
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 page-content animate-pulse">
        <div className="w-full max-w-7xl space-y-10">
          <div className="h-12 rounded-2xl w-80" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl h-44" style={{ ...card, opacity: 0.5 }} />
                  ))}
                </div>
                <div className="rounded-3xl h-72" style={{ ...card, opacity: 0.5 }} />
             </div>
             <div className="space-y-10">
                <div className="rounded-3xl h-36" style={{ ...card, opacity: 0.5 }} />
                <div className="rounded-3xl h-52" style={{ ...card, opacity: 0.5 }} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 pb-24 page-content animate-fade-in">
      <div className="w-full max-w-7xl space-y-10">
      
      {/* ─── Header Section ─── */}
      <div className="flex items-end justify-between flex-wrap gap-6 bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: '#09090b' }}>
            {getGreeting()}, {profile?.name || 'there'} 👋
          </h1>
          <p className="text-sm font-medium mt-2 flex items-center gap-2.5" style={{ color: '#71717a' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
          className="flex items-center gap-2.5 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
            boxShadow: '0 8px 24px rgba(5,150,105,0.25)',
          }}
        >
          <PlusCircle size={18} />
          Log a Meal
        </Link>
      </div>

      {/* ─── Main Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ─── LEFT COLUMN (Nutrition, Meals, Snacks) ─── */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Nutrient Summary */}
          <div>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 font-display tracking-tight" style={{ color: '#18181b' }}>
              <TrendingUp size={22} style={{ color: '#059669' }} />
              Today's Nutrition Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <NutrientCard label="Calories" value={totals.calories} recommended={recommended.calories} unit="kcal" icon={Flame} />
              <NutrientCard label="Protein" value={totals.protein} recommended={recommended.protein} unit="g" icon={Beef} />
              <NutrientCard label="Carbs" value={totals.carbs} recommended={recommended.carbs} unit="g" icon={Wheat} />
              <NutrientCard label="Fat" value={totals.fat} recommended={recommended.fat} unit="g" icon={Droplets} />
            </div>
          </div>

          {/* Today's Meals */}
          <div className="rounded-3xl p-8 md:p-10 transition-all duration-300" style={card}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold font-display tracking-tight" style={{ color: '#18181b' }}>
                Meal Log ({meals.length})
              </h2>
            </div>
            
            {meals.length === 0 ? (
              <div className="rounded-2xl p-14 text-center bg-white/50 border border-white/60">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                     style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <UtensilsCrossed size={28} style={{ color: '#a1a1aa' }} />
                </div>
                <p className="text-base font-semibold mb-2" style={{ color: '#52525b' }}>No meals logged yet today</p>
                <p className="text-sm font-medium mb-6" style={{ color: '#a1a1aa' }}>Start tracking your nutrition by logging your first meal</p>
                <Link
                  to="/add-meal"
                  className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/50"
                >
                  <PlusCircle size={16} />
                  Log your first meal
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {meals.map((meal) => (
                  <MealCard key={meal._id} meal={meal} onDelete={handleDeleteMeal} />
                ))}
              </div>
            )}
          </div>

          {/* Smart Snack Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5 font-display tracking-tight" style={{ color: '#18181b' }}>
                <Lightbulb size={22} style={{ color: '#f59e0b' }} />
                Smart Snack Suggestions
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 transition-all duration-300 bg-white/60 border border-white/80 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <span className="font-bold text-sm font-display text-zinc-900">{s.name}</span>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100/80 text-emerald-700 border border-emerald-200/50">
                        ₹{s.estimatedCost}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-zinc-500">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN (Sidebar: Alerts, Budget, Trends) ─── */}
        <div className="space-y-10">
          
          {/* Alerts / Notifications */}
          <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

          {/* Budget Tracker */}
          <div className="rounded-3xl p-7 transition-all duration-300" style={card}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2.5 font-display" style={{ color: '#18181b' }}>
                <Wallet size={18} style={{ color: '#059669' }} />
                Daily Budget
              </h3>
              <span className="text-xs font-bold px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200/50">
                ₹{spent} / ₹{budget}
              </span>
            </div>
            
            <div className="w-full rounded-full h-3.5 overflow-hidden bg-zinc-200/50 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  background: budgetPercentage > 100
                    ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                    : budgetPercentage > 75
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #34d399, #059669)',
                }}
              />
            </div>
            
            {budgetPercentage > 100 ? (
              <p className="text-xs font-semibold mt-4 text-red-500 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
                ⚠ Budget exceeded by ₹{spent - budget}
              </p>
            ) : (
              <p className="text-xs font-medium mt-4 text-zinc-500 text-center">
                {100 - budgetPercentage}% remaining today
              </p>
            )}
          </div>

          {/* Weekly Trend Chart */}
          {weeklyData.length > 0 && (
            <div className="rounded-3xl p-7" style={card}>
              <h2 className="text-sm font-bold mb-7 flex items-center gap-2.5 font-display" style={{ color: '#18181b' }}>
                <TrendingUp size={18} style={{ color: '#6366f1' }} />
                Weekly Calorie Trend
              </h2>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      stroke="#a1a1aa"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString('en-IN', { weekday: 'short' });
                      }}
                    />
                    <YAxis 
                      stroke="#a1a1aa" 
                      fontSize={11} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '16px',
                        color: '#18181b',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        padding: '10px 14px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#ffffff', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
      </div>
      </div>
    </div>
  );
}

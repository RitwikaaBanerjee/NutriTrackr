/**
 * Dashboard Page — NutriTrackr
 *
 * Premium health dashboard with greeting, nutrition cards,
 * meal log, budget tracker, and weekly trends.
 * Features cute emoji stickers and a spacious, clean layout.
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

/* ── Shared frosted card ── */
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

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, mealsRes, alertsRes, weeklyRes] = await Promise.allSettled([
        api.getProfile(), api.getTodayMeals(), api.getAlerts(), api.getWeeklyReport(),
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
    try { await api.deleteMeal(mealId); toast.success('Meal deleted'); fetchDashboardData(); }
    catch { toast.error('Failed to delete meal'); }
  };

  const handleDismissAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  const budget = profile?.dailyBudget || 150;
  const spent = meals.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
  const budgetPercentage = Math.min(Math.round((spent / budget) * 100), 100);

  const dailyCompletion = Math.min(Math.round(
    ((totals.calories / recommended.calories) +
     (totals.protein / recommended.protein) +
     (totals.carbs / recommended.carbs) +
     (totals.fat / recommended.fat)) / 4 * 100
  ), 100) || 0;

  const greeting = getGreeting();

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 80px' }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ height: '80px', borderRadius: '20px', background: 'rgba(0,0,0,0.04)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '180px', borderRadius: '20px', background: 'rgba(0,0,0,0.03)' }} />
            ))}
          </div>
          <div style={{ height: '250px', borderRadius: '24px', background: 'rgba(0,0,0,0.03)' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 80px' }}>

      {/* ═══════ GREETING HEADER ═══════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', margin: 0 }}>
            {greeting.emoji} {greeting.text}, {profile?.name || 'there'}!
          </h1>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginTop: '6px' }}>
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/add-meal"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: '#fff', padding: '12px 24px', borderRadius: '16px',
            fontSize: '14px', fontWeight: 700, textDecoration: 'none',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <PlusCircle size={16} /> Log a Meal
        </Link>
      </div>

      {/* ═══════ DAILY PROGRESS BANNER ═══════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', padding: '16px 20px',
        borderRadius: '16px', marginBottom: '28px',
        background: dailyCompletion >= 80
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.04))',
        border: dailyCompletion >= 80 ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(245,158,11,0.12)',
      }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#3f3f46', margin: 0 }}>
          {dailyCompletion >= 80 ? '🎯 Almost at your daily goal! Keep going.' :
           dailyCompletion >= 40 ? '🥗 Good progress — log more meals to stay on track.' :
           '🍽️ Start logging meals to track your nutrition today.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '100px', height: '8px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px', transition: 'width 1s ease',
              width: `${dailyCompletion}%`,
              background: dailyCompletion >= 80 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #f97316)',
            }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: dailyCompletion >= 80 ? '#059669' : '#d97706' }}>
            {dailyCompletion}%
          </span>
        </div>
      </div>

      {/* ═══════ NUTRIENT CARDS ═══════ */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#27272a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: '#059669' }} /> Today's Nutrition 🥦
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <NutrientCard label="Calories" value={totals.calories} recommended={recommended.calories} unit="kcal" icon={Flame} />
          <NutrientCard label="Protein" value={totals.protein} recommended={recommended.protein} unit="g" icon={Beef} />
          <NutrientCard label="Carbs" value={totals.carbs} recommended={recommended.carbs} unit="g" icon={Wheat} />
          <NutrientCard label="Fat" value={totals.fat} recommended={recommended.fat} unit="g" icon={Droplets} />
        </div>
      </div>

      {/* ═══════ MAIN GRID ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

        {/* Use CSS media query via className for responsive grid */}
        <div className="dashboard-grid" style={{ display: 'grid', gap: '24px' }}>

          {/* ─── LEFT: Meal Log ─── */}
          <div className="dashboard-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...card, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  🍱 Meal Log
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                    {meals.length}
                  </span>
                </h2>
                <Link to="/add-meal" style={{
                  fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(16,185,129,0.08)', color: '#059669', textDecoration: 'none',
                  border: '1px solid rgba(16,185,129,0.1)',
                }}>
                  + Add
                </Link>
              </div>

              {meals.length === 0 ? (
                <div style={{
                  borderRadius: '16px', padding: '48px 20px', textAlign: 'center',
                  background: 'rgba(0,0,0,0.012)', border: '2px dashed rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>No meals logged yet today</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '16px' }}>
                    Start tracking your nutrition by logging your first meal
                  </p>
                  <Link to="/add-meal" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: 700, padding: '10px 18px', borderRadius: '12px',
                    background: 'rgba(16,185,129,0.08)', color: '#059669', textDecoration: 'none',
                    border: '1px solid rgba(16,185,129,0.12)',
                  }}>
                    <PlusCircle size={14} /> Log your first meal
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {meals.map((meal) => (
                    <MealCard key={meal._id} meal={meal} onDelete={handleDeleteMeal} />
                  ))}
                </div>
              )}
            </div>

            {/* Smart Snack Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#18181b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} style={{ color: '#f59e0b' }} /> Smart Snack Suggestions 🍿
                </h2>
                <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  {suggestions.map((s, i) => (
                    <div key={i} style={{
                      ...card, padding: '20px', borderRadius: '18px',
                      transition: 'transform 0.2s', cursor: 'default',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#18181b' }}>{s.name}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                          ₹{s.estimatedCost}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#71717a', lineHeight: 1.5 }}>{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Sidebar widgets ─── */}
          <div className="dashboard-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Alerts */}
            <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

            {/* Budget Tracker */}
            <div style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#18181b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  💰 Daily Budget
                </h3>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.03)', color: '#52525b', border: '1px solid rgba(0,0,0,0.04)',
                }}>
                  ₹{spent} / ₹{budget}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', borderRadius: '999px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '999px', transition: 'width 0.7s ease',
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  background: budgetPercentage > 100
                    ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                    : budgetPercentage > 75
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #34d399, #059669)',
                }} />
              </div>
              {budgetPercentage > 100 ? (
                <p style={{ fontSize: '12px', fontWeight: 600, marginTop: '10px', color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  ⚠️ Budget exceeded by ₹{spent - budget}
                </p>
              ) : (
                <p style={{ fontSize: '12px', fontWeight: 500, marginTop: '10px', color: '#a1a1aa', textAlign: 'center' }}>
                  {100 - budgetPercentage}% remaining today ✨
                </p>
              )}
            </div>

            {/* Motivational Card */}
            <div style={{
              ...card, padding: '24px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(99,102,241,0.04))',
              border: '1px solid rgba(16,185,129,0.1)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                {dailyCompletion >= 80 ? '🏆' : dailyCompletion >= 40 ? '💪' : '🌱'}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                {dailyCompletion >= 80 ? 'Outstanding!' : dailyCompletion >= 40 ? 'Keep it up!' : 'Just getting started'}
              </p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>
                {dailyCompletion >= 80 ? "You're crushing your goals today! 🎉" :
                 dailyCompletion >= 40 ? 'You are halfway to your daily targets 🚀' :
                 'Every healthy meal counts! Start now 🌿'}
              </p>
            </div>

            {/* Weekly Trend Chart */}
            {weeklyData.length > 0 && (
              <div style={{ ...card, padding: '24px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#18181b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 Weekly Calorie Trend
                </h2>
                <div style={{ height: '170px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#d4d4d8" fontSize={11} axisLine={false} tickLine={false}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { weekday: 'short' })} />
                      <YAxis stroke="#d4d4d8" fontSize={11} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px',
                          fontSize: '12px', fontWeight: 700, boxShadow: '0 8px 20px rgba(0,0,0,0.06)', padding: '8px 12px',
                        }}
                      />
                      <Line type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={2.5}
                        dot={{ fill: '#fff', stroke: '#6366f1', strokeWidth: 2, r: 3.5 }}
                        activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
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

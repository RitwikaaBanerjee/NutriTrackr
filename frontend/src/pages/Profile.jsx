/**
 * Profile Page
 *
 * User profile setup and editing form with BMI calculation,
 * profile completion indicator, and all health-related fields.
 * Styled for premium light-mode frosted glass aesthetic with proper spacing.
 */
import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { UserCircle, Save, Activity, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Intense exercise daily' },
];

const card = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
  borderRadius: '24px',
};

const inputStyle = {
  width: '100%',
  padding: '16px 20px',
  borderRadius: '16px',
  border: '2px solid rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.9)',
  fontSize: '0.95rem',
  color: '#18181b',
  fontWeight: '500',
  outline: 'none',
  transition: 'all 0.3s ease',
};

const focusHandler = (e) => {
  e.target.style.borderColor = 'rgba(99,102,241,0.5)';
  e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)';
  e.target.style.background = '#ffffff';
};
const blurHandler = (e) => {
  e.target.style.borderColor = 'rgba(0,0,0,0.05)';
  e.target.style.boxShadow = 'none';
  e.target.style.background = 'rgba(255,255,255,0.9)';
};

export default function Profile() {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', height: '', weight: '',
    activityLevel: 'moderate', dailyBudget: 150, foodPreference: 'veg',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const data = res.data.data;
        setForm({
          name: data.name || '', age: data.age || '', gender: data.gender || '',
          height: data.height || '', weight: data.weight || '',
          activityLevel: data.activityLevel || 'moderate',
          dailyBudget: data.dailyBudget || 150, foodPreference: data.foodPreference || 'veg',
        });
      } catch (err) { console.log('No existing profile:', err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    setSaving(true);
    try {
      await api.updateProfile({
        ...form, age: Number(form.age) || undefined, height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined, dailyBudget: Number(form.dailyBudget) || 150,
      });
      toast.success('Profile saved! ✅');
    } catch (err) { toast.error('Failed to save profile'); console.error(err); }
    finally { setSaving(false); }
  };

  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null;

  const getBmiCategory = (bmi) => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: '#3b82f6' };
    if (val < 25) return { label: 'Normal', color: '#10b981' };
    if (val < 30) return { label: 'Overweight', color: '#f59e0b' };
    return { label: 'Obese', color: '#ef4444' };
  };

  const fields = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'dailyBudget'];
  const filledCount = fields.filter((f) => form[f]).length;
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  if (loading) {
    return (
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 page-content animate-pulse">
        <div className="w-full max-w-3xl space-y-10">
          <div className="h-16 rounded-3xl w-full" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="rounded-3xl h-96" style={{ ...card, opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 pb-24 page-content animate-fade-in">
      <div className="w-full max-w-3xl space-y-10">
        
        {/* ─── Page Title ─── */}
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm">
          <h1 className="text-3xl font-extrabold flex items-center gap-4 font-display text-zinc-900 tracking-tight">
            <UserCircle size={34} className="text-indigo-600" />
            Your Profile
          </h1>
        </div>

        {/* ─── Completion Indicator ─── */}
        <div className="rounded-3xl p-8" style={card}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">Profile Completion</span>
            <span className="text-sm font-bold px-4 py-2 rounded-full" style={{ 
              background: completionPercent === 100 ? '#d1fae5' : '#fef3c7',
              color: completionPercent === 100 ? '#059669' : '#d97706',
            }}>
              {filledCount} of {fields.length} fields
            </span>
          </div>
          <div className="w-full rounded-full h-3.5 overflow-hidden shadow-inner" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="h-3.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${completionPercent}%`,
                background: completionPercent === 100
                  ? 'linear-gradient(90deg, #34d399, #059669)'
                  : 'linear-gradient(90deg, #fbbf24, #d97706)',
              }}
            />
          </div>
        </div>

        {/* ─── BMI Card ─── */}
        {bmi && (
          <div className="rounded-3xl p-8 flex items-center gap-8" style={card}>
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center shrink-0"
              style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #818cf8, #4f46e5)', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}
            >
              <Scale size={30} style={{ color: '#fff' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">Body Mass Index (BMI)</p>
              <div className="flex items-end gap-5">
                <p className="text-4xl font-extrabold text-zinc-900 leading-none">{bmi}</p>
                <span
                  className="text-sm font-bold px-4 py-2 rounded-xl border"
                  style={{
                    color: getBmiCategory(bmi).color,
                    background: `${getBmiCategory(bmi).color}12`,
                    borderColor: `${getBmiCategory(bmi).color}30`,
                  }}
                >
                  {getBmiCategory(bmi).label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Profile Form ─── */}
        <div className="rounded-3xl p-8 sm:p-12 space-y-10" style={card}>
          
          {/* Name */}
          <div>
            <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Full Name</label>
            <input
              id="profile-name" type="text" value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)' }} />

          {/* Age + Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Age</label>
              <input
                id="profile-age" type="number" min="10" max="100" value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g., 20" style={inputStyle}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Gender</label>
              <select
                id="profile-gender" value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                onFocus={focusHandler} onBlur={blurHandler}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Height + Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Height (cm)</label>
              <input
                id="profile-height" type="number" min="100" max="250" value={form.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="e.g., 170" style={inputStyle}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Weight (kg)</label>
              <input
                id="profile-weight" type="number" min="20" max="300" value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="e.g., 65" style={inputStyle}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)' }} />

          {/* Activity Level */}
          <div>
            <label className="text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2.5 text-zinc-500">
              <Activity size={16} />
              Activity Level
            </label>
            <select
              id="profile-activity" value={form.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusHandler} onBlur={blurHandler}
            >
              {activityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
              ))}
            </select>
          </div>

          {/* Daily Budget */}
          <div>
            <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">Daily Budget (₹)</label>
            <input
              id="profile-budget" type="number" min="50" max="2000" value={form.dailyBudget}
              onChange={(e) => handleChange('dailyBudget', e.target.value)}
              placeholder="e.g., 150" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)' }} />

          {/* Food Preference */}
          <div>
            <label className="text-xs font-bold tracking-widest uppercase mb-6 block text-zinc-500">Food Preference</label>
            <div className="grid grid-cols-3 gap-5 sm:gap-6">
              {[
                { value: 'veg', emoji: '🥬', label: 'Vegetarian', color: '#10b981' },
                { value: 'non-veg', emoji: '🍗', label: 'Non-Veg', color: '#f97316' },
                { value: 'vegan', emoji: '🌱', label: 'Vegan', color: '#22c55e' },
              ].map((opt) => {
                const isActive = form.foodPreference === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('foodPreference', opt.value)}
                    className="flex flex-col items-center gap-3.5 p-6 rounded-2xl transition-all duration-300 cursor-pointer"
                    style={{
                      border: isActive ? `2px solid ${opt.color}50` : '2px solid rgba(0,0,0,0.05)',
                      background: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      transform: isActive ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
                      boxShadow: isActive ? `0 10px 25px ${opt.color}20` : 'none',
                    }}
                  >
                    <span className="text-4xl sm:text-5xl">{opt.emoji}</span>
                    <span className="text-sm font-bold" style={{ color: isActive ? opt.color : '#71717a' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              id="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className="w-full text-white font-bold py-4.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] cursor-pointer text-lg shadow-xl"
              style={{
                padding: '18px',
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 10px 30px rgba(5,150,105,0.3)',
                animation: 'gradientShift 4s ease-in-out infinite',
              }}
            >
              {saving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save size={22} />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

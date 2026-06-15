/**
 * Profile Page
 *
 * User profile setup and editing form with BMI calculation,
 * profile completion indicator, and all health-related fields.
 * Styled for light-mode frosted glass aesthetic.
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
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
  borderRadius: '18px',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1.5px solid rgba(0,0,0,0.06)',
  background: 'rgba(255,255,255,0.8)',
  fontSize: '0.875rem',
  color: '#18181b',
  outline: 'none',
  transition: 'all 0.25s ease',
};

const focusHandler = (e) => {
  e.target.style.borderColor = 'rgba(99,102,241,0.4)';
  e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)';
  e.target.style.background = '#ffffff';
};
const blurHandler = (e) => {
  e.target.style.borderColor = 'rgba(0,0,0,0.06)';
  e.target.style.boxShadow = 'none';
  e.target.style.background = 'rgba(255,255,255,0.8)';
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
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 rounded-xl w-48" style={{ background: 'rgba(0,0,0,0.04)' }} />
        <div className="rounded-2xl h-96" style={{ ...card, opacity: 0.5 }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <h1 className="text-2xl font-bold flex items-center gap-3 font-display" style={{ color: '#18181b' }}>
        <UserCircle size={28} style={{ color: '#6366f1' }} />
        Your Profile
      </h1>

      {/* ─── Completion Indicator ─── */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#71717a' }}>Profile Completion</span>
          <span className="text-xs font-bold" style={{ color: completionPercent === 100 ? '#10b981' : '#f59e0b' }}>
            {filledCount} of {fields.length} fields
          </span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${completionPercent}%`,
              background: completionPercent === 100
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #f59e0b, #d97706)',
            }}
          />
        </div>
      </div>

      {/* ─── BMI Card ─── */}
      {bmi && (
        <div className="rounded-2xl p-5 flex items-center gap-4" style={card}>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}
          >
            <Scale size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#71717a' }}>Body Mass Index (BMI)</p>
            <p className="text-2xl font-extrabold" style={{ color: '#18181b' }}>{bmi}</p>
          </div>
          <span
            className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{
              color: getBmiCategory(bmi).color,
              background: `${getBmiCategory(bmi).color}12`,
              border: `1px solid ${getBmiCategory(bmi).color}20`,
            }}
          >
            {getBmiCategory(bmi).label}
          </span>
        </div>
      )}

      {/* ─── Profile Form ─── */}
      <div className="rounded-2xl p-6 space-y-5" style={card}>
        {/* Name */}
        <div>
          <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Full Name</label>
          <input
            id="profile-name" type="text" value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your name" style={inputStyle}
            onFocus={focusHandler} onBlur={blurHandler}
          />
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Age</label>
            <input
              id="profile-age" type="number" min="10" max="100" value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g., 20" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Gender</label>
            <select
              id="profile-gender" value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusHandler} onBlur={blurHandler}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Height (cm)</label>
            <input
              id="profile-height" type="number" min="100" max="250" value={form.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="e.g., 170" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Weight (kg)</label>
            <input
              id="profile-weight" type="number" min="20" max="300" value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="e.g., 65" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block flex items-center gap-1.5" style={{ color: '#71717a' }}>
            <Activity size={14} />
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
          <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: '#71717a' }}>Daily Budget (₹)</label>
          <input
            id="profile-budget" type="number" min="50" max="2000" value={form.dailyBudget}
            onChange={(e) => handleChange('dailyBudget', e.target.value)}
            placeholder="e.g., 150" style={inputStyle}
            onFocus={focusHandler} onBlur={blurHandler}
          />
        </div>

        {/* Food Preference */}
        <div>
          <label className="text-xs font-semibold tracking-wider uppercase mb-3 block" style={{ color: '#71717a' }}>Food Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'veg', emoji: '🥬', label: 'Vegetarian', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
              { value: 'non-veg', emoji: '🍗', label: 'Non-Veg', gradient: 'linear-gradient(135deg, #fb923c, #f97316)' },
              { value: 'vegan', emoji: '🌱', label: 'Vegan', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
            ].map((opt) => {
              const isActive = form.foodPreference === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('foodPreference', opt.value)}
                  className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    border: isActive ? '1.5px solid rgba(0,0,0,0.1)' : '1.5px solid rgba(0,0,0,0.04)',
                    background: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: isActive ? '#18181b' : '#71717a' }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          id="save-profile-btn"
          onClick={handleSave}
          disabled={saving}
          className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
            backgroundSize: '200% 200%',
            boxShadow: '0 6px 20px rgba(5,150,105,0.25)',
            animation: 'gradientShift 4s ease-in-out infinite',
          }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

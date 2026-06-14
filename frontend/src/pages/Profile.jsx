/**
 * Profile Page
 *
 * User profile setup and editing form with BMI calculation,
 * profile completion indicator, and all health-related fields.
 */
import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { UserCircle, Save, Activity, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

// Activity level options with descriptions
const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Intense exercise daily' },
];

export default function Profile() {
  // Form fields
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    dailyBudget: 150,
    foodPreference: 'veg',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const data = res.data.data;
        setForm({
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || '',
          height: data.height || '',
          weight: data.weight || '',
          activityLevel: data.activityLevel || 'moderate',
          dailyBudget: data.dailyBudget || 150,
          foodPreference: data.foodPreference || 'veg',
        });
      } catch (err) {
        // Profile may not exist yet — that's OK
        console.log('No existing profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update form fields
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({
        ...form,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
        dailyBudget: Number(form.dailyBudget) || 150,
      });
      toast.success('Profile saved! ✅');
    } catch (err) {
      toast.error('Failed to save profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // BMI calculation
  const bmi =
    form.height && form.weight
      ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
      : null;

  const getBmiCategory = (bmi) => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (val < 25) return { label: 'Normal', color: 'text-green-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  // Profile completion
  const fields = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'dailyBudget'];
  const filledCount = fields.filter((f) => form[f]).length;
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-xl w-48" />
        <div className="glass rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <UserCircle className="text-indigo-400" size={28} />
        Your Profile
      </h1>

      {/* ─── Completion Indicator ─── */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Profile Completion</span>
          <span className={`text-sm font-medium ${completionPercent === 100 ? 'text-green-400' : 'text-amber-400'}`}>
            {filledCount} of {fields.length} fields
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              completionPercent === 100 ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* ─── BMI Card ─── */}
      {bmi && (
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Scale size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Body Mass Index (BMI)</p>
            <p className="text-2xl font-bold text-white">{bmi}</p>
          </div>
          <span className={`ml-auto text-sm font-medium ${getBmiCategory(bmi).color}`}>
            {getBmiCategory(bmi).label}
          </span>
        </div>
      )}

      {/* ─── Profile Form ─── */}
      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all"
          />
        </div>

        {/* Age + Gender (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Age</label>
            <input
              id="profile-age"
              type="number"
              min="10"
              max="100"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g., 20"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Gender</label>
            <select
              id="profile-gender"
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm transition-all appearance-none"
            >
              <option value="" className="bg-[#1a1a2e]">Select</option>
              <option value="male" className="bg-[#1a1a2e]">Male</option>
              <option value="female" className="bg-[#1a1a2e]">Female</option>
              <option value="other" className="bg-[#1a1a2e]">Other</option>
            </select>
          </div>
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Height (cm)</label>
            <input
              id="profile-height"
              type="number"
              min="100"
              max="250"
              value={form.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="e.g., 170"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Weight (kg)</label>
            <input
              id="profile-weight"
              type="number"
              min="20"
              max="300"
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="e.g., 65"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1.5">
            <Activity size={14} />
            Activity Level
          </label>
          <select
            id="profile-activity"
            value={form.activityLevel}
            onChange={(e) => handleChange('activityLevel', e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm transition-all appearance-none"
          >
            {activityOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                {opt.label} — {opt.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Daily Budget */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Daily Budget (₹)</label>
          <input
            id="profile-budget"
            type="number"
            min="50"
            max="2000"
            value={form.dailyBudget}
            onChange={(e) => handleChange('dailyBudget', e.target.value)}
            placeholder="e.g., 150"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all"
          />
        </div>

        {/* Food Preference (radio cards) */}
        <div>
          <label className="text-sm text-gray-400 mb-3 block">Food Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'veg', emoji: '🥬', label: 'Vegetarian' },
              { value: 'non-veg', emoji: '🍗', label: 'Non-Veg' },
              { value: 'vegan', emoji: '🌱', label: 'Vegan' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('foodPreference', opt.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                  form.foodPreference === opt.value
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 scale-105'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          id="save-profile-btn"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

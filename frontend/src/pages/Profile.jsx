/**
 * Profile Page — NutriTrackr
 *
 * Premium profile editor with avatar, animated BMI gauge,
 * visual activity-level picker, food preference cards,
 * profile completion ring, and organized grouped sections.
 */
import { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  UserCircle, Save, Activity, Scale, Heart,
  Ruler, Weight, Calendar, Wallet, Sparkles,
  ChevronRight, Shield, Utensils,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Activity Options ── */
const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', emoji: '🛋️', color: '#94a3b8' },
  { value: 'light', label: 'Light', desc: '1-3 days/week', emoji: '🚶', color: '#60a5fa' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week', emoji: '🏃', color: '#34d399' },
  { value: 'active', label: 'Active', desc: '6-7 days/week', emoji: '💪', color: '#f59e0b' },
  { value: 'very_active', label: 'Very Active', desc: 'Intense daily', emoji: '🔥', color: '#f43f5e' },
];

/* ── Shared Styles ── */
const card = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
  borderRadius: '24px',
};

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: '14px',
  border: '2px solid rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.9)',
  fontSize: '0.95rem',
  color: '#18181b',
  fontWeight: '500',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  fontFamily: 'inherit',
};

const focusHandler = (e) => {
  e.target.style.borderColor = 'rgba(99,102,241,0.45)';
  e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)';
  e.target.style.background = '#ffffff';
};
const blurHandler = (e) => {
  e.target.style.borderColor = 'rgba(0,0,0,0.05)';
  e.target.style.boxShadow = 'none';
  e.target.style.background = 'rgba(255,255,255,0.9)';
};

/* ── Section Header Component ── */
function SectionHeader({ icon: Icon, title, subtitle, color = '#6366f1' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '14px',
        background: `${color}12`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#18181b', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 500, margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Profile() {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', height: '', weight: '',
    activityLevel: 'moderate', dailyBudget: 150, foodPreference: 'veg',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' or 'ft'
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const data = res.data.data;
        const h = data.height || '';
        setForm({
          name: data.name || '', age: data.age || '', gender: data.gender || '',
          height: h, weight: data.weight || '',
          activityLevel: data.activityLevel || 'moderate',
          dailyBudget: data.dailyBudget || 150, foodPreference: data.foodPreference || 'veg',
        });
        // Pre-fill ft/in from saved cm value
        if (h) {
          const totalInches = h / 2.54;
          setHeightFt(Math.floor(totalInches / 12).toString());
          setHeightIn(Math.round(totalInches % 12).toString());
        }
      } catch (err) { console.log('No existing profile:', err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  /* ── Height unit helpers ── */
  const handleHeightCmChange = (cmVal) => {
    handleChange('height', cmVal);
    if (cmVal) {
      const totalInches = cmVal / 2.54;
      setHeightFt(Math.floor(totalInches / 12).toString());
      setHeightIn(Math.round(totalInches % 12).toString());
    } else {
      setHeightFt(''); setHeightIn('');
    }
  };
  const handleHeightFtInChange = (ft, inches) => {
    setHeightFt(ft); setHeightIn(inches);
    const totalInches = (Number(ft) || 0) * 12 + (Number(inches) || 0);
    const cm = Math.round(totalInches * 2.54);
    handleChange('height', cm > 0 ? cm : '');
  };
  const toggleHeightUnit = () => {
    setHeightUnit((prev) => (prev === 'cm' ? 'ft' : 'cm'));
  };

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

  /* ── Computed Values ── */
  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null;

  const getBmiCategory = (bmi) => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: '#3b82f6', emoji: '💙' };
    if (val < 25) return { label: 'Normal', color: '#10b981', emoji: '💚' };
    if (val < 30) return { label: 'Overweight', color: '#f59e0b', emoji: '🧡' };
    return { label: 'Obese', color: '#ef4444', emoji: '❤️' };
  };

  const fields = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'dailyBudget'];
  const filledCount = fields.filter((f) => form[f]).length;
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  /* ── Initials for Avatar ── */
  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  /* ── Completion Ring SVG ── */
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPercent / 100) * ringCircumference;

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ height: '160px', borderRadius: '24px', background: 'rgba(0,0,0,0.04)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ height: '260px', borderRadius: '24px', background: 'rgba(0,0,0,0.03)' }} />
            <div style={{ height: '260px', borderRadius: '24px', background: 'rgba(0,0,0,0.03)' }} />
          </div>
          <div style={{ height: '200px', borderRadius: '24px', background: 'rgba(0,0,0,0.03)' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* ═══════ PROFILE HERO CARD ═══════ */}
      <div style={{
        ...card, padding: '32px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '22px', flexShrink: 0,
          background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #818cf8 100%)',
          boxShadow: '0 8px 28px rgba(52,211,153,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 800, color: '#fff',
          letterSpacing: '0.02em',
        }}>
          {initials}
        </div>

        {/* Name & Email */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800, color: '#18181b',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            {form.name || 'Your Profile'} <span style={{ fontSize: '1.2rem' }}>✨</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, marginTop: '4px' }}>
            Manage your health data & preferences
          </p>
        </div>

        {/* Completion Ring */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '12px 20px 12px 14px', borderRadius: '16px',
          background: completionPercent === 100 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${completionPercent === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
        }}>
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r={ringRadius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
              <circle cx="32" cy="32" r={ringRadius} fill="none"
                stroke={completionPercent === 100 ? '#10b981' : '#f59e0b'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: completionPercent === 100 ? '#059669' : '#d97706',
            }}>
              {completionPercent}%
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Profile
            </p>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: completionPercent === 100 ? '#059669' : '#d97706' }}>
              {filledCount}/{fields.length} done
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ TWO-COLUMN LAYOUT ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* ── LEFT: Personal Info ── */}
        <div style={{ ...card, padding: '28px' }}>
          <SectionHeader icon={UserCircle} title="Personal Info" subtitle="Your basic details" color="#6366f1" />

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'block' }}>
              Full Name
            </label>
            <input
              id="profile-name" type="text" value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name" style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>

          {/* Age & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} /> Age
              </label>
              <input
                id="profile-age" type="number" min="10" max="100" value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g., 20" style={inputStyle}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'block' }}>
                Gender
              </label>
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

          {/* Height & Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ruler size={13} /> Height
                </label>
                {/* cm / ft toggle */}
                <button
                  type="button" onClick={toggleHeightUnit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0',
                    borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)',
                    overflow: 'hidden', cursor: 'pointer', fontSize: '0.7rem',
                    fontWeight: 700, fontFamily: 'inherit', background: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <span style={{
                    padding: '3px 10px',
                    background: heightUnit === 'cm' ? '#6366f1' : 'transparent',
                    color: heightUnit === 'cm' ? '#fff' : '#71717a',
                    transition: 'all 0.2s ease',
                  }}>cm</span>
                  <span style={{
                    padding: '3px 10px',
                    background: heightUnit === 'ft' ? '#6366f1' : 'transparent',
                    color: heightUnit === 'ft' ? '#fff' : '#71717a',
                    transition: 'all 0.2s ease',
                  }}>ft</span>
                </button>
              </div>

              {heightUnit === 'cm' ? (
                <input
                  id="profile-height" type="number" min="100" max="250" value={form.height}
                  onChange={(e) => handleHeightCmChange(e.target.value)}
                  placeholder="e.g., 170" style={inputStyle}
                  onFocus={focusHandler} onBlur={blurHandler}
                />
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      id="profile-height-ft" type="number" min="3" max="8" value={heightFt}
                      onChange={(e) => handleHeightFtInChange(e.target.value, heightIn)}
                      placeholder="5" style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                    <span style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none',
                    }}>ft</span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      id="profile-height-in" type="number" min="0" max="11" value={heightIn}
                      onChange={(e) => handleHeightFtInChange(heightFt, e.target.value)}
                      placeholder="7" style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                    <span style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none',
                    }}>in</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Weight size={13} /> Weight (kg)
              </label>
              <input
                id="profile-weight" type="number" min="20" max="300" value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="e.g., 65" style={inputStyle}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: BMI & Budget ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* BMI Card */}
          <div style={{
            ...card, padding: '28px', flex: 1,
            background: bmi
              ? `linear-gradient(135deg, ${getBmiCategory(bmi).color}08, rgba(255,255,255,0.65))`
              : card.background,
          }}>
            <SectionHeader icon={Scale} title="Body Mass Index" subtitle="Based on height & weight" color={bmi ? getBmiCategory(bmi).color : '#6366f1'} />

            {bmi ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* BMI Visual Gauge */}
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={getBmiCategory(bmi).color}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 - (Math.min(parseFloat(bmi) / 40, 1)) * 2 * Math.PI * 40}
                      style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181b', lineHeight: 1 }}>{bmi}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#a1a1aa', marginTop: '2px' }}>BMI</span>
                  </div>
                </div>

                {/* BMI Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '10px', marginBottom: '10px',
                    background: `${getBmiCategory(bmi).color}12`,
                    border: `1px solid ${getBmiCategory(bmi).color}25`,
                  }}>
                    <span>{getBmiCategory(bmi).emoji}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getBmiCategory(bmi).color }}>
                      {getBmiCategory(bmi).label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                    {parseFloat(bmi) < 18.5 ? 'Consider adding more nutrient-rich meals to your diet.' :
                      parseFloat(bmi) < 25 ? 'Great job! You\'re in a healthy weight range.' :
                        parseFloat(bmi) < 30 ? 'Consider increasing physical activity.' :
                          'Consult a healthcare professional for guidance.'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '24px 16px',
                borderRadius: '16px', background: 'rgba(0,0,0,0.02)',
              }}>
                <Scale size={32} style={{ color: '#d4d4d8', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 600, margin: 0 }}>
                  Enter height & weight to calculate BMI
                </p>
              </div>
            )}
          </div>

          {/* Daily Budget Card */}
          <div style={{ ...card, padding: '28px' }}>
            <SectionHeader icon={Wallet} title="Daily Budget" subtitle="Set your spending limit" color="#f59e0b" />
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1.1rem', fontWeight: 700, color: '#a1a1aa', pointerEvents: 'none',
              }}>₹</span>
              <input
                id="profile-budget" type="number" min="50" max="2000" value={form.dailyBudget}
                onChange={(e) => handleChange('dailyBudget', e.target.value)}
                placeholder="150" style={{ ...inputStyle, paddingLeft: '40px', fontSize: '1.1rem', fontWeight: 700 }}
                onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 500, marginTop: '10px' }}>
              💡 Average hostel student spends ₹120–200/day on food
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ ACTIVITY LEVEL ═══════ */}
      <div style={{ ...card, padding: '28px', marginBottom: '24px' }}>
        <SectionHeader icon={Activity} title="Activity Level" subtitle="How active are you?" color="#8b5cf6" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {activityOptions.map((opt) => {
            const isActive = form.activityLevel === opt.value;
            return (
              <button
                key={opt.value} type="button"
                onClick={() => handleChange('activityLevel', opt.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '18px 10px', borderRadius: '16px', cursor: 'pointer',
                  border: isActive ? `2px solid ${opt.color}60` : '2px solid rgba(0,0,0,0.04)',
                  background: isActive ? `${opt.color}08` : 'rgba(255,255,255,0.5)',
                  transform: isActive ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                  boxShadow: isActive ? `0 8px 24px ${opt.color}18` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>{opt.emoji}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isActive ? opt.color : '#52525b' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#a1a1aa', lineHeight: 1.3 }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ FOOD PREFERENCE ═══════ */}
      <div style={{ ...card, padding: '28px', marginBottom: '24px' }}>
        <SectionHeader icon={Utensils} title="Food Preference" subtitle="Your dietary choice" color="#10b981" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { value: 'veg', emoji: '🥬', label: 'Vegetarian', desc: 'Plant-based meals', color: '#10b981' },
            { value: 'non-veg', emoji: '🍗', label: 'Non-Veg', desc: 'Includes meat', color: '#f97316' },
            { value: 'vegan', emoji: '🌱', label: 'Vegan', desc: 'No animal products', color: '#22c55e' },
          ].map((opt) => {
            const isActive = form.foodPreference === opt.value;
            return (
              <button
                key={opt.value} type="button"
                onClick={() => handleChange('foodPreference', opt.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  padding: '24px 16px', borderRadius: '18px', cursor: 'pointer',
                  border: isActive ? `2px solid ${opt.color}50` : '2px solid rgba(0,0,0,0.04)',
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  transform: isActive ? 'scale(1.03) translateY(-3px)' : 'scale(1)',
                  boxShadow: isActive ? `0 12px 30px ${opt.color}18` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{opt.emoji}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? opt.color : '#52525b' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#a1a1aa' }}>
                  {opt.desc}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, color: opt.color,
                    background: `${opt.color}10`, padding: '3px 10px', borderRadius: '8px',
                    border: `1px solid ${opt.color}20`,
                  }}>
                    ✓ Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ SAVE BUTTON ═══════ */}
      <button
        id="save-profile-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          color: '#fff', fontWeight: 700, fontSize: '1rem',
          padding: '18px', borderRadius: '18px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
          backgroundSize: '200% 200%',
          boxShadow: '0 8px 30px rgba(5,150,105,0.3)',
          animation: 'gradientShift 4s ease-in-out infinite',
          transition: 'all 0.3s ease',
          opacity: saving ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {saving ? (
          <>
            <span style={{
              width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
              display: 'inline-block',
            }} />
            Saving Profile...
          </>
        ) : (
          <>
            <Save size={20} />
            Save Profile Changes
          </>
        )}
      </button>

      {/* ── Footer Hint ── */}
      <p style={{
        textAlign: 'center', fontSize: '0.78rem', color: '#c4c4cc',
        marginTop: '16px', fontWeight: 500,
      }}>
        <Shield size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
        Your data is securely stored and never shared
      </p>

    </div>
  );
}

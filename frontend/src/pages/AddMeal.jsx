/**
 * AddMeal Page
 *
 * Log meals via text or image upload.
 * AI analyzes food → shows nutrients → user saves the meal.
 * Uniform 20px gaps, aesthetic frosted glass, cute stickers.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import {
  UtensilsCrossed, Coffee, Sun, Moon, Cookie,
  Camera, Sparkles, Save, RotateCcw, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, emoji: '☕', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { id: 'lunch', label: 'Lunch', icon: Sun, emoji: '🍛', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { id: 'dinner', label: 'Dinner', icon: Moon, emoji: '🌙', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
  { id: 'snack', label: 'Snack', icon: Cookie, emoji: '🍪', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
];

/* Uniform spacing constant — every section gap is 20px */
const GAP = '20px';

const cardStyle = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  borderRadius: '20px',
  padding: '28px',
};

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: '14px',
  border: '2px solid rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.9)',
  fontSize: '0.9rem',
  color: '#18181b',
  fontWeight: '500',
  outline: 'none',
  transition: 'all 0.25s ease',
};

const labelStyle = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '10px',
  display: 'flex', alignItems: 'center', gap: '6px',
};

export default function AddMeal() {
  const navigate = useNavigate();
  const [mealType, setMealType] = useState('lunch');
  const [inputMode, setInputMode] = useState('text');
  const [foodText, setFoodText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nutrients, setNutrients] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setNutrients(null);
  };

  const handleDrop = (e) => { e.preventDefault(); handleImageSelect(e.dataTransfer.files[0]); };

  const handleAnalyzeText = async () => {
    if (!foodText.trim()) { toast.error('Please describe your meal first'); return; }
    setAnalyzing(true);
    try {
      const res = await api.analyzeText(foodText);
      const data = res.data.data;
      setNutrients({ calories: data.calories || 0, protein: data.protein || 0, carbs: data.carbs || 0, fat: data.fat || 0, iron: data.iron || 0 });
      setDetectedItems(data.items || []);
      setEstimatedCost(data.estimatedCost || 0);
      setDescription(foodText);
      toast.success('Food analyzed! ✨');
    } catch (err) { toast.error('Analysis failed. Try again.'); console.error(err); }
    finally { setAnalyzing(false); }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) { toast.error('Please upload an image first'); return; }
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await api.analyzeImage(formData);
      const data = res.data.data;
      setNutrients({ calories: data.calories || 0, protein: data.protein || 0, carbs: data.carbs || 0, fat: data.fat || 0, iron: data.iron || 0 });
      setDetectedItems(data.items || []);
      setEstimatedCost(data.estimatedCost || 0);
      setDescription(data.description || data.items?.join(', ') || 'Food from image');
      toast.success('Image analyzed! 📸');
    } catch (err) { toast.error('Image analysis failed. Try again.'); console.error(err); }
    finally { setAnalyzing(false); }
  };

  const handleSaveMeal = async () => {
    if (!nutrients) { toast.error('Analyze your food first'); return; }
    setSaving(true);
    try {
      await api.addMeal({ mealType, description: description || foodText, nutrients, estimatedCost, date });
      toast.success('Meal logged! 🎉');
      navigate('/dashboard');
    } catch (err) { toast.error('Failed to save meal'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setNutrients(null); setFoodText(''); setImageFile(null); setImagePreview(null);
    setDetectedItems([]); setEstimatedCost(0); setDescription('');
  };

  const focusHandler = (e) => {
    e.target.style.borderColor = 'rgba(16,185,129,0.5)';
    e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)';
    e.target.style.background = '#ffffff';
  };
  const blurHandler = (e) => {
    e.target.style.borderColor = 'rgba(0,0,0,0.05)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(255,255,255,0.9)';
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: `24px 24px 80px` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>

        {/* ═══════ PAGE HEADER ═══════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>🍽️</span> Log a Meal
            </h1>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginTop: '4px' }}>
              Tell us what you ate — we'll handle the nutrition math ✨
            </p>
          </div>
        </div>

        {/* ═══════ DATE + MEAL TYPE (side by side on desktop) ═══════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: GAP }}>
          {/* Date picker */}
          <div style={cardStyle}>
            <div style={labelStyle}>
              <Calendar size={13} /> Date
            </div>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              onFocus={focusHandler} onBlur={blurHandler}
            />
          </div>

          {/* Meal type */}
          <div style={cardStyle}>
            <div style={labelStyle}>Meal Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {mealTypes.map((type) => {
                const isActive = mealType === type.id;
                return (
                  <button key={type.id} onClick={() => setMealType(type.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '14px 8px', borderRadius: '14px', cursor: 'pointer',
                      border: isActive ? '2px solid rgba(0,0,0,0.08)' : '2px solid transparent',
                      background: isActive ? '#ffffff' : 'rgba(0,0,0,0.015)',
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: isActive ? '0 6px 20px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease',
                    }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? type.gradient : 'rgba(0,0,0,0.04)',
                      fontSize: isActive ? '20px' : '18px',
                      transition: 'all 0.2s ease',
                    }}>
                      {isActive ? <type.icon size={20} style={{ color: '#fff' }} /> : <span>{type.emoji}</span>}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#18181b' : '#71717a' }}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ INPUT MODE TOGGLE ═══════ */}
        <div style={{
          display: 'flex', gap: '6px', padding: '6px',
          borderRadius: '16px', background: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          {[
            { mode: 'text', label: '✍️ Text Description' },
            { mode: 'image', label: '📸 Food Photo' },
          ].map(({ mode, label }) => (
            <button key={mode} onClick={() => setInputMode(mode)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                border: 'none',
                background: inputMode === mode ? '#ffffff' : 'transparent',
                color: inputMode === mode ? '#059669' : '#71717a',
                boxShadow: inputMode === mode ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ═══════ TEXT INPUT ═══════ */}
        {inputMode === 'text' && (
          <div style={cardStyle}>
            <div style={labelStyle}>🥗 What did you eat?</div>
            <textarea
              id="food-text-input"
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              placeholder="e.g., 2 rotis with dal, 1 cup rice, and mixed veg sabzi"
              rows={4}
              style={{ ...inputStyle, resize: 'none', marginBottom: GAP }}
              onFocus={focusHandler} onBlur={blurHandler}
            />
            <button
              id="analyze-text-btn"
              onClick={handleAnalyzeText}
              disabled={analyzing || !foodText.trim()}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                opacity: (analyzing || !foodText.trim()) ? 0.5 : 1,
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                backgroundSize: '200% 200%', animation: 'gradientShift 4s ease-in-out infinite',
                boxShadow: '0 6px 20px rgba(5,150,105,0.2)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { if (!analyzing) e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {analyzing ? (
                <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
              ) : (
                <><Sparkles size={18} /> Analyze with AI ✨</>
              )}
            </button>
          </div>
        )}

        {/* ═══════ IMAGE UPLOAD ═══════ */}
        {inputMode === 'image' && (
          <div style={cardStyle}>
            <div style={labelStyle}>📷 Upload Food Photo</div>
            {!imagePreview ? (
              <div
                onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload').click()}
                style={{
                  borderRadius: '16px', padding: '48px 20px', textAlign: 'center',
                  cursor: 'pointer', border: '3px dashed rgba(0,0,0,0.06)',
                  background: 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
              >
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#52525b', marginBottom: '4px' }}>
                  Drop food image here or click to browse
                </p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#a1a1aa' }}>
                  Supports JPG, PNG, WebP
                </p>
                <input id="image-upload" type="file" accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files[0])} style={{ display: 'none' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <img src={imagePreview} alt="Food preview" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); setNutrients(null); }}
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      padding: '8px 16px', borderRadius: '10px', border: 'none',
                      fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer',
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    }}>
                    Change Image
                  </button>
                </div>
                <button id="analyze-image-btn" onClick={handleAnalyzeImage} disabled={analyzing}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    opacity: analyzing ? 0.5 : 1,
                    background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                    backgroundSize: '200% 200%', animation: 'gradientShift 4s ease-in-out infinite',
                    boxShadow: '0 6px 20px rgba(5,150,105,0.2)',
                  }}>
                  {analyzing ? (
                    <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
                  ) : (
                    <><Sparkles size={18} /> Analyze Image with AI 📸</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ANALYSIS RESULTS ═══════ */}
        {nutrients && (
          <div style={{ ...cardStyle, animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: GAP, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔬 Analysis Results
              </h3>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)' }}>
                AI Powered
              </span>
            </div>

            {detectedItems.length > 0 && (
              <div style={{ marginBottom: GAP }}>
                <div style={labelStyle}>🍲 Detected Items</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {detectedItems.map((item, i) => (
                    <span key={i} style={{
                      padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                      color: '#059669', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: GAP }}>
              {[
                { key: 'calories', label: '🔥 Calories', unit: 'kcal' },
                { key: 'protein', label: '🥩 Protein', unit: 'g' },
                { key: 'carbs', label: '🌾 Carbs', unit: 'g' },
                { key: 'fat', label: '🫒 Fat', unit: 'g' },
                { key: 'iron', label: '💊 Iron', unit: 'mg' },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <div style={{ ...labelStyle, fontSize: '10px' }}>{label} ({unit})</div>
                  <input
                    type="number"
                    value={Math.round(nutrients[key] || 0)}
                    onChange={(e) => setNutrients((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    style={{ ...inputStyle, padding: '12px 14px', fontSize: '1.05rem', fontWeight: 800 }}
                    onFocus={focusHandler} onBlur={blurHandler}
                  />
                </div>
              ))}
              <div>
                <div style={{ ...labelStyle, fontSize: '10px' }}>💰 Cost (₹)</div>
                <input
                  type="number" value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  style={{ ...inputStyle, padding: '12px 14px', fontSize: '1.05rem', fontWeight: 800 }}
                  onFocus={focusHandler} onBlur={blurHandler}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button id="save-meal-btn" onClick={handleSaveMeal} disabled={saving}
                style={{
                  flex: 1, padding: '16px', borderRadius: '16px', border: 'none',
                  color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: saving ? 0.5 : 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'scale(1.01)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {saving ? (
                  <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                ) : (
                  <><Save size={18} /> Log Meal to Diary 🎉</>
                )}
              </button>
              <button onClick={handleReset}
                style={{
                  padding: '16px 28px', borderRadius: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '14px', fontWeight: 700, color: '#71717a',
                  background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; }}
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

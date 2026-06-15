/**
 * AddMeal Page
 *
 * Log meals via text or image upload.
 * AI analyzes food → shows nutrients → user saves the meal.
 * Styled for light-mode frosted glass aesthetic.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import {
  UtensilsCrossed, Coffee, Sun, Moon, Cookie,
  Camera, Sparkles, Save, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { id: 'lunch', label: 'Lunch', icon: Sun, gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { id: 'dinner', label: 'Dinner', icon: Moon, gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
  { id: 'snack', label: 'Snack', icon: Cookie, gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
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
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setNutrients(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageSelect(e.dataTransfer.files[0]);
  };

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
      setNutrients(null); setFoodText(''); setImageFile(null); setImagePreview(null);
      setDetectedItems([]); setEstimatedCost(0); setDescription('');
    } catch (err) { toast.error('Failed to save meal'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setNutrients(null); setFoodText(''); setImageFile(null); setImagePreview(null);
    setDetectedItems([]); setEstimatedCost(0); setDescription('');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <h1 className="text-2xl font-bold flex items-center gap-3 font-display" style={{ color: '#18181b' }}>
        <UtensilsCrossed size={28} style={{ color: '#059669' }} />
        Log a Meal
      </h1>

      {/* ─── Date Picker ─── */}
      <div className="rounded-2xl p-5" style={card}>
        <label className="text-xs font-semibold tracking-wider uppercase mb-2 block" style={{ color: '#71717a' }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      {/* ─── Meal Type Selector ─── */}
      <div className="rounded-2xl p-5" style={card}>
        <label className="text-xs font-semibold tracking-wider uppercase mb-3 block" style={{ color: '#71717a' }}>Meal Type</label>
        <div className="grid grid-cols-4 gap-2.5">
          {mealTypes.map((type) => {
            const isActive = mealType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setMealType(type.id)}
                className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  border: isActive ? '1.5px solid rgba(0,0,0,0.1)' : '1.5px solid rgba(0,0,0,0.04)',
                  background: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isActive ? type.gradient : 'rgba(0,0,0,0.04)' }}
                >
                  <type.icon size={16} style={{ color: isActive ? '#fff' : '#71717a' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: isActive ? '#18181b' : '#71717a' }}>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Input Mode Toggle ─── */}
      <div className="flex gap-2">
        {[
          { mode: 'text', label: '✍️ Text Description' },
          { mode: 'image', label: '📸 Food Photo' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: inputMode === mode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
              border: inputMode === mode ? '1.5px solid rgba(99,102,241,0.2)' : '1.5px solid rgba(0,0,0,0.04)',
              color: inputMode === mode ? '#4f46e5' : '#71717a',
              boxShadow: inputMode === mode ? '0 2px 8px rgba(99,102,241,0.08)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Text Input Mode ─── */}
      {inputMode === 'text' && (
        <div className="rounded-2xl p-5 space-y-4" style={card}>
          <textarea
            id="food-text-input"
            value={foodText}
            onChange={(e) => setFoodText(e.target.value)}
            placeholder="Describe your meal... e.g., 2 rotis with dal, rice, sabzi"
            rows={4}
            style={{ ...inputStyle, resize: 'none', padding: '16px' }}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
          <button
            id="analyze-text-btn"
            onClick={handleAnalyzeText}
            disabled={analyzing || !foodText.trim()}
            className="w-full text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.2)',
            }}
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze with AI ✨
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── Image Upload Mode ─── */}
      {inputMode === 'image' && (
        <div className="rounded-2xl p-5 space-y-4" style={card}>
          {!imagePreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload').click()}
              className="rounded-2xl p-10 text-center cursor-pointer transition-all group"
              style={{ border: '2px dashed rgba(0,0,0,0.1)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            >
              <Camera size={40} className="mx-auto mb-3 transition-colors" style={{ color: '#a1a1aa' }} />
              <p className="text-sm mb-1" style={{ color: '#71717a' }}>Drop food image here or click to browse</p>
              <p className="text-xs" style={{ color: '#a1a1aa' }}>Supports JPG, PNG, WebP</p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); setNutrients(null); }}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg text-xs text-white transition-all cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  Change
                </button>
              </div>
              <button
                id="analyze-image-btn"
                onClick={handleAnalyzeImage}
                disabled={analyzing}
                className="w-full text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                  boxShadow: '0 4px 16px rgba(5,150,105,0.2)',
                }}
              >
                {analyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Image with AI ✨
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Analysis Results ─── */}
      {nutrients && (
        <div className="rounded-2xl p-5 space-y-5 animate-slide-in" style={card}>
          <h3 className="text-lg font-semibold font-display" style={{ color: '#18181b' }}>Analysis Results</h3>

          {detectedItems.length > 0 && (
            <div>
              <p className="text-sm mb-2" style={{ color: '#71717a' }}>Detected Items:</p>
              <div className="flex flex-wrap gap-2">
                {detectedItems.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ color: '#4f46e5', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.1)' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein', label: 'Protein', unit: 'g' },
              { key: 'carbs', label: 'Carbs', unit: 'g' },
              { key: 'fat', label: 'Fat', unit: 'g' },
              { key: 'iron', label: 'Iron', unit: 'mg' },
            ].map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-[11px] font-semibold mb-1 block uppercase tracking-wider" style={{ color: '#71717a' }}>{label} ({unit})</label>
                <input
                  type="number"
                  value={Math.round(nutrients[key] || 0)}
                  onChange={(e) => setNutrients((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  style={{ ...inputStyle, padding: '10px 12px' }}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-semibold mb-1 block uppercase tracking-wider" style={{ color: '#71717a' }}>Cost (₹)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                style={{ ...inputStyle, padding: '10px 12px' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              id="save-meal-btn"
              onClick={handleSaveMeal}
              disabled={saving}
              className="flex-1 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
              }}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Meal
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              style={{ border: '1.5px solid rgba(0,0,0,0.06)', color: '#71717a', background: 'rgba(255,255,255,0.5)' }}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

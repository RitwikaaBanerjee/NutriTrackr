/**
 * AddMeal Page
 *
 * Log meals via text or image upload.
 * AI analyzes food → shows nutrients → user saves the meal.
 * Styled for premium light-mode frosted glass aesthetic with proper spacing.
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
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { id: 'lunch', label: 'Lunch', icon: Sun, gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { id: 'dinner', label: 'Dinner', icon: Moon, gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
  { id: 'snack', label: 'Snack', icon: Cookie, gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
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
      navigate('/dashboard');
    } catch (err) { toast.error('Failed to save meal'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setNutrients(null); setFoodText(''); setImageFile(null); setImagePreview(null);
    setDetectedItems([]); setEstimatedCost(0); setDescription('');
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

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 pb-24 page-content animate-fade-in">
      <div className="w-full max-w-3xl space-y-10">
        
        {/* ─── Page Title ─── */}
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm">
          <h1 className="text-3xl font-extrabold flex items-center gap-4 font-display text-zinc-900 tracking-tight">
            <UtensilsCrossed size={34} className="text-emerald-600" />
            Log a Meal
          </h1>
        </div>

        {/* ─── Date Picker ─── */}
        <div className="rounded-3xl p-8" style={card}>
          <label className="text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2.5 text-zinc-500">
            <Calendar size={16} />
            Date of Meal
          </label>
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
        <div className="rounded-3xl p-8" style={card}>
          <label className="text-xs font-bold tracking-widest uppercase mb-6 block text-zinc-500">Meal Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {mealTypes.map((type) => {
              const isActive = mealType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className="flex flex-col items-center gap-3.5 p-6 rounded-2xl transition-all duration-300 cursor-pointer"
                  style={{
                    border: isActive ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(0,0,0,0.03)',
                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    transform: isActive ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
                    boxShadow: isActive ? '0 10px 25px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? type.gradient : 'rgba(0,0,0,0.04)' }}
                  >
                    <type.icon size={26} style={{ color: isActive ? '#fff' : '#71717a' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: isActive ? '#18181b' : '#71717a' }}>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Input Mode Toggle ─── */}
        <div className="flex gap-4 bg-white/50 p-2.5 rounded-2xl border border-white/60">
          {[
            { mode: 'text', label: '✍️ Text Description' },
            { mode: 'image', label: '📸 Food Photo' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className="flex-1 py-4 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{
                background: inputMode === mode ? '#ffffff' : 'transparent',
                color: inputMode === mode ? '#4f46e5' : '#71717a',
                boxShadow: inputMode === mode ? '0 4px 14px rgba(99,102,241,0.1)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Text Input Mode ─── */}
        {inputMode === 'text' && (
          <div className="rounded-3xl p-8 space-y-8" style={card}>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-4 block text-zinc-500">What did you eat?</label>
              <textarea
                id="food-text-input"
                value={foodText}
                onChange={(e) => setFoodText(e.target.value)}
                placeholder="e.g., 2 rotis with dal, 1 cup rice, and mixed veg sabzi"
                rows={5}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <button
              id="analyze-text-btn"
              onClick={handleAnalyzeText}
              disabled={analyzing || !foodText.trim()}
              className="w-full text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-lg shadow-xl"
              style={{
                padding: '18px',
                background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease-in-out infinite',
              }}
            >
              {analyzing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Food...
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  Analyze with AI ✨
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── Image Upload Mode ─── */}
        {inputMode === 'image' && (
          <div className="rounded-3xl p-8 space-y-8" style={card}>
            <label className="text-xs font-bold tracking-widest uppercase mb-1 block text-zinc-500">Upload Food Photo</label>
            {!imagePreview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload').click()}
                className="rounded-3xl p-14 text-center cursor-pointer transition-all bg-white/50 hover:bg-white/80 group"
                style={{ border: '3px dashed rgba(0,0,0,0.08)' }}
              >
                <Camera size={52} className="mx-auto mb-5 text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                <p className="text-base font-bold text-zinc-700 mb-2">Drop food image here or click to browse</p>
                <p className="text-sm text-zinc-400 font-medium">Supports JPG, PNG, WebP</p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-white/50">
                  <img src={imagePreview} alt="Food preview" className="w-full h-72 object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); setNutrients(null); }}
                    className="absolute top-4 right-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer backdrop-blur-md bg-black/40 hover:bg-black/60"
                  >
                    Change Image
                  </button>
                </div>
                <button
                  id="analyze-image-btn"
                  onClick={handleAnalyzeImage}
                  disabled={analyzing}
                  className="w-full text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-lg shadow-xl"
                  style={{
                    padding: '18px',
                    background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 4s ease-in-out infinite',
                  }}
                >
                  {analyzing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
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
          <div className="rounded-3xl p-8 sm:p-10 space-y-8 animate-slide-in" style={card}>
            <div className="flex items-center justify-between border-b border-black/5 pb-5">
              <h3 className="text-xl font-extrabold font-display text-zinc-900">Analysis Results</h3>
            </div>

            {detectedItems.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-4 text-zinc-500">Detected Items</p>
                <div className="flex flex-wrap gap-3">
                  {detectedItems.map((item, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ color: '#4f46e5', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal' },
                { key: 'protein', label: 'Protein', unit: 'g' },
                { key: 'carbs', label: 'Carbs', unit: 'g' },
                { key: 'fat', label: 'Fat', unit: 'g' },
                { key: 'iron', label: 'Iron', unit: 'mg' },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="text-xs font-bold tracking-widest uppercase mb-3 block text-zinc-500">{label} ({unit})</label>
                  <input
                    type="number"
                    value={Math.round(nutrients[key] || 0)}
                    onChange={(e) => setNutrients((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    style={{ ...inputStyle, padding: '14px 16px', fontSize: '1.1rem', fontWeight: '800' }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold tracking-widest uppercase mb-3 block text-zinc-500">Cost (₹)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  style={{ ...inputStyle, padding: '14px 16px', fontSize: '1.1rem', fontWeight: '800' }}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                />
              </div>
            </div>

            <div className="flex gap-5 pt-4">
              <button
                id="save-meal-btn"
                onClick={handleSaveMeal}
                disabled={saving}
                className="flex-1 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-lg shadow-xl"
                style={{ padding: '18px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {saving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    Log Meal to Diary
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-8 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer font-bold bg-white/60 hover:bg-white text-zinc-600 border-2 border-zinc-200/50 hover:border-zinc-300"
                style={{ padding: '18px 32px' }}
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

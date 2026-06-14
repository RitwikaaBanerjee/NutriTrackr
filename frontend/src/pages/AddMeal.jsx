/**
 * AddMeal Page
 *
 * Log meals via text or image upload.
 * AI analyzes food → shows nutrients → user saves the meal.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import {
  UtensilsCrossed, Coffee, Sun, Moon, Cookie,
  Camera, Sparkles, Save, RotateCcw, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Meal type configuration
const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'amber' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: 'green' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: 'purple' },
  { id: 'snack', label: 'Snack', icon: Cookie, color: 'blue' },
];

// Color utility for meal type buttons
const colorMap = {
  amber: { active: 'bg-amber-500/20 border-amber-500 text-amber-400', inactive: 'border-white/10 text-gray-400' },
  green: { active: 'bg-green-500/20 border-green-500 text-green-400', inactive: 'border-white/10 text-gray-400' },
  purple: { active: 'bg-purple-500/20 border-purple-500 text-purple-400', inactive: 'border-white/10 text-gray-400' },
  blue: { active: 'bg-blue-500/20 border-blue-500 text-blue-400', inactive: 'border-white/10 text-gray-400' },
};

export default function AddMeal() {
  const navigate = useNavigate();

  // Form state
  const [mealType, setMealType] = useState('lunch');
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'image'
  const [foodText, setFoodText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Analysis result state
  const [nutrients, setNutrients] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [description, setDescription] = useState('');

  // Loading states
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle image selection
  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setNutrients(null); // Reset previous analysis
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  // Analyze text input with AI
  const handleAnalyzeText = async () => {
    if (!foodText.trim()) {
      toast.error('Please describe your meal first');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await api.analyzeText(foodText);
      const data = res.data.data;
      setNutrients({
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        iron: data.iron || 0,
      });
      setDetectedItems(data.items || []);
      setEstimatedCost(data.estimatedCost || 0);
      setDescription(foodText);
      toast.success('Food analyzed! ✨');
    } catch (err) {
      toast.error('Analysis failed. Try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Analyze image with AI
  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await api.analyzeImage(formData);
      const data = res.data.data;
      setNutrients({
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        iron: data.iron || 0,
      });
      setDetectedItems(data.items || []);
      setEstimatedCost(data.estimatedCost || 0);
      setDescription(data.description || data.items?.join(', ') || 'Food from image');
      toast.success('Image analyzed! 📸');
    } catch (err) {
      toast.error('Image analysis failed. Try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Save the meal to backend
  const handleSaveMeal = async () => {
    if (!nutrients) {
      toast.error('Analyze your food first');
      return;
    }
    setSaving(true);
    try {
      await api.addMeal({
        mealType,
        description: description || foodText,
        nutrients,
        estimatedCost,
        date,
      });
      toast.success('Meal logged! 🎉');
      // Reset form
      setNutrients(null);
      setFoodText('');
      setImageFile(null);
      setImagePreview(null);
      setDetectedItems([]);
      setEstimatedCost(0);
      setDescription('');
    } catch (err) {
      toast.error('Failed to save meal');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setNutrients(null);
    setFoodText('');
    setImageFile(null);
    setImagePreview(null);
    setDetectedItems([]);
    setEstimatedCost(0);
    setDescription('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <UtensilsCrossed className="text-indigo-400" size={28} />
        Log a Meal
      </h1>

      {/* ─── Date Picker ─── */}
      <div className="glass glass-card-hover rounded-2xl p-5 border border-white/5">
        <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-2 block">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm w-full focus:border-indigo-500/40"
        />
      </div>

      {/* ─── Meal Type Selector ─── */}
      <div className="glass glass-card-hover rounded-2xl p-5 border border-white/5">
        <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3 block">Meal Type</label>
        <div className="grid grid-cols-4 gap-2.5">
          {mealTypes.map((type) => {
            const isActive = mealType === type.id;
            const colors = colorMap[type.color];
            return (
              <button
                key={type.id}
                onClick={() => setMealType(type.id)}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive ? `${colors.active} scale-105 shadow-md` : `${colors.inactive} hover:bg-white/5 hover:border-zinc-800`
                }`}
              >
                <type.icon size={18} />
                <span className="text-xs font-semibold">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Input Mode Toggle ─── */}
      <div className="flex gap-2">
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            inputMode === 'text'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
              : 'glass border-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          ✍️ Text Description
        </button>
        <button
          onClick={() => setInputMode('image')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            inputMode === 'image'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
              : 'glass border-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          📸 Food Photo
        </button>
      </div>

      {/* ─── Text Input Mode ─── */}
      {inputMode === 'text' && (
        <div className="glass rounded-2xl p-5 space-y-4 border border-white/5">
          <textarea
            id="food-text-input"
            value={foodText}
            onChange={(e) => setFoodText(e.target.value)}
            placeholder="Describe your meal... e.g., 2 rotis with dal, rice, sabzi"
            rows={4}
            className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl p-4 text-sm resize-none transition-all focus:border-indigo-500/40"
          />
          <button
            id="analyze-text-btn"
            onClick={handleAnalyzeText}
            disabled={analyzing || !foodText.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
        <div className="glass rounded-2xl p-5 space-y-4">
          {!imagePreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload').click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-500/50 transition-all group"
            >
              <Camera
                size={40}
                className="mx-auto text-gray-500 group-hover:text-indigo-400 transition-colors mb-3"
              />
              <p className="text-gray-400 text-sm mb-1">
                Drop food image here or click to browse
              </p>
              <p className="text-gray-600 text-xs">
                Supports JPG, PNG, WebP
              </p>
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
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setNutrients(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg text-xs hover:bg-black/70 transition-all"
                >
                  Change
                </button>
              </div>
              <button
                id="analyze-image-btn"
                onClick={handleAnalyzeImage}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
        <div className="glass rounded-2xl p-5 space-y-5 animate-slide-in">
          <h3 className="text-lg font-semibold text-white">Analysis Results</h3>

          {/* Detected items */}
          {detectedItems.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Detected Items:</p>
              <div className="flex flex-wrap gap-2">
                {detectedItems.map((item, i) => (
                  <span key={i} className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Editable nutrient fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein', label: 'Protein', unit: 'g' },
              { key: 'carbs', label: 'Carbs', unit: 'g' },
              { key: 'fat', label: 'Fat', unit: 'g' },
              { key: 'iron', label: 'Iron', unit: 'mg' },
            ].map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-[11px] font-semibold text-zinc-400 mb-1 block uppercase tracking-wider">{label} ({unit})</label>
                <input
                  type="number"
                  value={Math.round(nutrients[key] || 0)}
                  onChange={(e) =>
                    setNutrients((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:border-indigo-500/40"
                />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block uppercase tracking-wider">Cost (₹)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:border-indigo-500/40"
              />
            </div>
          </div>

          {/* Save / Reset buttons */}
          <div className="flex gap-3">
            <button
              id="save-meal-btn"
              onClick={handleSaveMeal}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
              className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
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

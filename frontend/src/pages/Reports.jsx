/**
 * Reports Page
 *
 * Weekly health report with charts, nutrient averages,
 * deficiency patterns, AI summary, and PDF download.
 * Styled for premium light-mode frosted glass aesthetic with proper spacing.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import {
  FileBarChart, Download, Brain, AlertTriangle,
  TrendingUp, Calendar, PlusCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const card = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
  borderRadius: '24px',
};

const tooltipStyle = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: '16px',
  color: '#18181b',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  fontWeight: 'bold',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  padding: '12px 16px',
};

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyReport();
      setReport(res.data.data);
    } catch (err) { console.error('Failed to fetch report:', err); }
    finally { setLoading(false); }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await api.downloadPdf();
      toast.success('Report downloaded! 📄');
    } catch (err) { toast.error('Failed to download report'); console.error(err); }
    finally { setDownloading(false); }
  };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const dateRange = `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle}>
        <p style={{ color: '#71717a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, padding: '2px 0' }}>{entry.name}: {Math.round(entry.value)}</p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 page-content animate-pulse">
        <div className="w-full max-w-6xl space-y-10">
          <div className="h-16 rounded-3xl w-full max-w-2xl" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => <div key={i} className="rounded-3xl h-40" style={{ ...card, opacity: 0.5 }} />)}
          </div>
          <div className="rounded-3xl h-[400px]" style={{ ...card, opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  if (!report || !report.dailyBreakdown || report.dailyBreakdown.length === 0) {
    return (
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 page-content animate-fade-in">
        <div className="w-full max-w-6xl space-y-10">
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm max-w-3xl">
            <h1 className="text-3xl font-extrabold flex items-center gap-4 font-display text-zinc-900 tracking-tight">
              <FileBarChart size={34} className="text-indigo-600" />
              Weekly Health Report
            </h1>
          </div>
          <div className="rounded-3xl p-16 sm:p-20 text-center max-w-3xl" style={card}>
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                 style={{ background: 'rgba(99,102,241,0.08)' }}>
              <FileBarChart size={36} style={{ color: '#a1a1aa' }} />
            </div>
            <p className="text-2xl font-extrabold text-zinc-800 mb-3 font-display">No data for this period</p>
            <p className="text-base text-zinc-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
              Start logging your meals to generate weekly nutrition reports and receive personalized AI insights!
            </p>
            <Link
              to="/add-meal"
              className="inline-flex items-center gap-2.5 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                boxShadow: '0 8px 24px rgba(5,150,105,0.25)',
              }}
            >
              <PlusCircle size={18} />
              Log Your First Meal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { dailyBreakdown, averages, deficiencies, suggestions, summary } = report;
  const chartData = dailyBreakdown.map((day) => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' }),
  }));

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 pb-24 page-content animate-fade-in">
      <div className="w-full max-w-6xl space-y-10">
      
      {/* ─── Header Section ─── */}
      <div className="flex items-end justify-between flex-wrap gap-6 bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-4 font-display text-zinc-900 tracking-tight">
            <FileBarChart size={34} className="text-indigo-600" />
            Weekly Health Report
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold border border-indigo-100">
              <Calendar size={14} />
              {dateRange}
            </span>
          </div>
        </div>
        
        <button
          id="download-pdf-btn"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-3 text-white px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
            boxShadow: '0 8px 24px rgba(5,150,105,0.25)',
          }}
        >
          {downloading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={18} />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* ─── Nutrient Averages Grid ─── */}
      {averages && (
        <div>
          <h2 className="text-sm font-bold tracking-widest uppercase mb-5 text-zinc-500 ml-2">Daily Averages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { label: 'Calories', value: averages.calories, rec: 2200, unit: 'kcal' },
              { label: 'Protein', value: averages.protein, rec: 55, unit: 'g' },
              { label: 'Carbs', value: averages.carbs, rec: 275, unit: 'g' },
              { label: 'Fat', value: averages.fat, rec: 60, unit: 'g' },
              { label: 'Iron', value: averages.iron, rec: 19, unit: 'mg' },
            ].map((item) => {
              const pct = Math.round(((item.value || 0) / item.rec) * 100);
              return (
                <div key={item.label} className="rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={card}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3 text-zinc-500">{item.label}</p>
                  <p className="text-3xl font-extrabold text-zinc-900 leading-none">{Math.round(item.value || 0)}</p>
                  <p className="text-xs font-bold text-zinc-400 mt-2 mb-5">/ {item.rec} {item.unit}</p>
                  <div className="w-full rounded-full h-2.5 overflow-hidden shadow-inner" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Charts Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Calorie Trend Chart */}
        <div className="rounded-3xl p-8 sm:p-10" style={card}>
          <h2 className="text-lg font-extrabold mb-8 flex items-center gap-3 font-display text-zinc-900">
            <TrendingUp size={22} className="text-indigo-500" />
            Calorie Trend
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={4} fill="url(#colorCalories)" name="Calories" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Breakdown Chart */}
        <div className="rounded-3xl p-8 sm:p-10" style={card}>
          <h2 className="text-lg font-extrabold mb-8 font-display text-zinc-900">Macro Breakdown by Day</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />
                <Bar dataKey="protein" name="Protein" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="carbs" name="Carbs" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fat" name="Fat" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Bottom Grid: AI Summary & Deficiencies ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* AI Health Summary */}
        {summary && (
          <div className="lg:col-span-2 rounded-3xl p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-lg font-extrabold mb-6 flex items-center gap-3 font-display text-zinc-900">
              <Brain size={24} className="text-purple-600" />
              AI Dietitian Summary
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-line font-medium text-zinc-700">{summary}</p>
          </div>
        )}

        {/* Deficiency Patterns */}
        {deficiencies && deficiencies.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-5 flex items-center gap-2.5 text-zinc-500 ml-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Deficiency Alerts
            </h2>
            <div className="grid gap-5">
              {deficiencies.map((d, i) => {
                const severityColor = d.severity === 'critical' ? '#ef4444' : d.severity === 'moderate' ? '#f59e0b' : '#eab308';
                return (
                  <div
                    key={i}
                    className="rounded-3xl p-7 transition-all hover:-translate-y-1"
                    style={{ ...card, borderLeft: `6px solid ${severityColor}` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-extrabold text-base capitalize font-display text-zinc-900">{d.nutrient}</span>
                      <span
                        className="text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider"
                        style={{ color: severityColor, background: `${severityColor}15`, border: `1px solid ${severityColor}30` }}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-500">
                      Current: <span className="text-zinc-900">{d.current}</span> / <span className="text-zinc-400">{d.recommended}</span> 
                      <span className="ml-2 text-xs">({d.percentage}%)</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

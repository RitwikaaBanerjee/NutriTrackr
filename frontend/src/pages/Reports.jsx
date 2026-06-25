/**
 * Reports Page — NutriTrackr
 *
 * Weekly health report with charts, nutrient averages,
 * deficiency patterns, AI summary, and PDF download.
 * Styled with premium glassmorphism and cute aesthetic food stickers.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import {
  FileBarChart, Download, Brain, AlertTriangle,
  TrendingUp, Calendar, PlusCircle, Lock, BarChart3,
  Flame, Dumbbell, Wheat, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const card = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.01)',
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

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyReport();
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await api.downloadPdf();
      toast.success('Report downloaded! 📄');
    } catch (err) {
      toast.error('Failed to download report');
      console.error(err);
    } finally {
      setDownloading(false);
    }
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
          <p key={i} style={{ color: entry.color, padding: '2px 0' }}>
            {entry.name}: {Math.round(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 page-content animate-pulse">
        <div className="w-full max-w-6xl space-y-10">
          <div className="h-[90px] rounded-3xl w-full max-w-2xl bg-white/40 border border-white/50" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-3xl h-44 bg-white/40 border border-white/50" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="rounded-3xl h-[380px] bg-white/40 border border-white/50" />
            <div className="rounded-3xl h-[380px] bg-white/40 border border-white/50" />
          </div>
        </div>
      </div>
    );
  }

  // --- Empty State Redesign ---
  if (!report || !report.dailyBreakdown || report.dailyBreakdown.length === 0) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-7xl mx-auto space-y-6">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Health Report</h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} /> {dateRange}
              </p>
            </div>

            <Link
              to="/add-meal"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusCircle size={18} />
              Log Your First Meal
            </Link>
          </div>

          {/* Quick Stats Row (Empty) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Calories', icon: <Flame size={16} className="text-orange-500" /> },
              { label: 'Avg Protein', icon: <Dumbbell size={16} className="text-blue-500" /> },
              { label: 'Avg Carbs', icon: <Wheat size={16} className="text-amber-500" /> },
              { label: 'Health Score', icon: <Activity size={16} className="text-emerald-500" /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-slate-300">--</div>
              </div>
            ))}
          </div>

          {/* Main Dashboard Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Chart Area (Blurred out) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <h3 className="font-semibold text-slate-800">Caloric Breakdown</h3>
                <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse"></div>
              </div>

              <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-50/50">
                {/* Faint Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Lock Overlay */}
                <div className="relative z-20 flex flex-col items-center text-center max-w-sm bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Analytics Locked</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Log at least one meal to unlock your weekly nutritional charts and visual breakdowns.
                  </p>
                  <Link
                    to="/add-meal"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Start Tracking
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar (AI Insights & Deficiencies) */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">AI Dietitian Insights</h3>
                </div>
                <div className="space-y-3 opacity-30 blur-[2px] pointer-events-none select-none">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">Needs Data</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <h3 className="font-semibold text-slate-800">Deficiency Alerts</h3>
                </div>
                <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-1/2"></div><div className="h-2 bg-slate-200 rounded w-1/3"></div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-1/2"></div><div className="h-2 bg-slate-200 rounded w-1/3"></div></div>
                  </div>
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">Needs Data</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- Filled State Redesign ---
  const { dailyBreakdown, averages, deficiencies, suggestions, summary } = report;
  const chartData = dailyBreakdown.map((day) => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' }),
  }));

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 pb-24 page-content animate-fade-in relative">
      <div className="w-full max-w-6xl space-y-10 relative">


        {/* Header Section */}
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

        {/* Nutrient Averages Grid */}
        {averages && (
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-5 text-zinc-500 ml-2">Daily Averages</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { label: 'Calories', value: averages.calories, rec: 2200, unit: 'kcal', border: 'border-indigo-500/20', text: 'text-indigo-600', fill: '#6366f1' },
                { label: 'Protein', value: averages.protein, rec: 55, unit: 'g', border: 'border-blue-500/20', text: 'text-blue-600', fill: '#3b82f6' },
                { label: 'Carbs', value: averages.carbs, rec: 275, unit: 'g', border: 'border-violet-500/20', text: 'text-violet-600', fill: '#8b5cf6' },
                { label: 'Fat', value: averages.fat, rec: 60, unit: 'g', border: 'border-amber-500/20', text: 'text-amber-600', fill: '#f59e0b' },
                { label: 'Iron', value: averages.iron, rec: 19, unit: 'mg', border: 'border-rose-500/20', text: 'text-rose-600', fill: '#f43f5e' },
              ].map((item) => {
                const pct = Math.round(((item.value || 0) / item.rec) * 100);
                return (
                  <div
                    key={item.label}
                    className={`rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 border hover:shadow-xl hover:shadow-slate-200/50 bg-white/80 backdrop-blur-xl ${item.border}`}
                    style={{
                      boxShadow: '0 4px 20px rgba(0,0,0,0.015), 0 1px 4px rgba(0,0,0,0.01)',
                    }}
                  >
                    <p className={`text-xs font-extrabold tracking-widest uppercase mb-3 ${item.text}`}>{item.label}</p>
                    <p className="text-3xl font-black text-zinc-900 leading-none">{Math.round(item.value || 0)}</p>
                    <p className="text-xs font-bold text-zinc-400 mt-2.5 mb-6">/ {item.rec} {item.unit}</p>
                    <div className="w-full bg-zinc-100/80 rounded-full h-2.5 overflow-hidden p-[2px] border border-zinc-200/25">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: item.fill,
                          boxShadow: `0 0 10px ${item.fill}50`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase">Target</span>
                      <span className={`text-xs font-black ${item.text}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Calorie Trend Chart */}
          <div
            className="rounded-3xl p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/80 hover:shadow-xl transition-all duration-300"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.015)'
            }}
          >
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-3 font-display text-zinc-900">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500 border border-indigo-100">
                <TrendingUp size={18} />
              </span>
              Calorie Trend
            </h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.1)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={4} fill="url(#colorCalories)" name="Calories" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Breakdown Chart */}
          <div
            className="rounded-3xl p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/80 hover:shadow-xl transition-all duration-300"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.015)'
            }}
          >
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-3 font-display text-zinc-900">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50 text-violet-500 border border-violet-100">
                <BarChart3 size={18} />
              </span>
              Macro Breakdown by Day
            </h2>
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

        {/* Bottom Grid: AI Summary & Deficiencies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* AI Health Summary */}
          {summary && (
            <div className="lg:col-span-2 rounded-3xl p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-lg font-extrabold mb-6 flex items-center gap-3 font-display text-zinc-900">
                <Brain size={24} className="text-purple-600" />
                AI Dietitian Summary
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-line font-semibold text-zinc-700">{summary}</p>
            </div>
          )}

          {/* Deficiency Patterns */}
          {deficiencies && deficiencies.length > 0 && (
            <div className="space-y-5">
              <h2 className="text-xs font-extrabold tracking-widest uppercase mb-5 flex items-center gap-2.5 text-zinc-500 ml-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Deficiency Alerts
              </h2>
              <div className="grid gap-5">
                {deficiencies.map((d, i) => {
                  const severityColor = d.severity === 'critical' ? '#ef4444' : d.severity === 'moderate' ? '#f59e0b' : '#eab308';
                  return (
                    <div
                      key={i}
                      className="rounded-3xl p-7 transition-all hover:-translate-y-1.5 duration-200 border bg-white/80 backdrop-blur-xl"
                      style={{
                        borderLeft: `6px solid ${severityColor}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.015), 0 1px 4px rgba(0,0,0,0.01)',
                      }}
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

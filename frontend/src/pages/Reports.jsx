/**
 * Reports Page
 *
 * Weekly health report with charts, nutrient averages,
 * deficiency patterns, AI summary, and PDF download.
 */
import { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  FileBarChart, Download, Brain, AlertTriangle,
  TrendingUp, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

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

  // Handle PDF download
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

  // Date range display
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const dateRange = `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {Math.round(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-xl w-64" />
        <div className="glass rounded-2xl h-20" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28" />
          ))}
        </div>
        <div className="glass rounded-2xl h-64" />
      </div>
    );
  }

  // Empty state
  if (!report || !report.dailyBreakdown || report.dailyBreakdown.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileBarChart className="text-indigo-400" size={28} />
          Weekly Health Report
        </h1>
        <div className="glass rounded-2xl p-12 text-center">
          <FileBarChart size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg mb-2">No data for this period</p>
          <p className="text-gray-500 text-sm">Start logging meals to see your weekly report!</p>
        </div>
      </div>
    );
  }

  const { dailyBreakdown, averages, deficiencies, suggestions, summary } = report;

  // Format daily data for charts
  const chartData = dailyBreakdown.map((day) => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' }),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileBarChart className="text-indigo-400" size={28} />
          Weekly Health Report
        </h1>
        <button
          id="download-pdf-btn"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={15} />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* ─── Date Range ─── */}
      <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 w-fit border border-white/5 bg-zinc-900/50">
        <Calendar size={14} className="text-indigo-400" />
        <span className="text-zinc-300 text-xs font-semibold">{dateRange}</span>
      </div>

      {/* ─── Nutrient Averages ─── */}
      {averages && (
        <div>
          <h2 className="text-sm font-bold text-zinc-400 tracking-wider uppercase mb-3.5">Daily Averages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {[
              { label: 'Calories', value: averages.calories, rec: 2200, unit: 'kcal' },
              { label: 'Protein', value: averages.protein, rec: 55, unit: 'g' },
              { label: 'Carbs', value: averages.carbs, rec: 275, unit: 'g' },
              { label: 'Fat', value: averages.fat, rec: 60, unit: 'g' },
              { label: 'Iron', value: averages.iron, rec: 19, unit: 'mg' },
            ].map((item) => {
              const pct = Math.round(((item.value || 0) / item.rec) * 100);
              const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={item.label} className="glass glass-card-hover rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase mb-1">{item.label}</p>
                  <p className="text-2xl font-extrabold text-white">{Math.round(item.value || 0)}</p>
                  <p className="text-xs text-zinc-500 font-medium mb-3">/ {item.rec} {item.unit}</p>
                  <div className="w-full bg-zinc-800/80 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-1 rounded-full ${barColor} transition-all`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Calorie Trend Chart ─── */}
      <div className="glass glass-card-hover rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2 font-display">
          <TrendingUp size={18} className="text-indigo-400" />
          Calorie Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#4b5563" fontSize={11} />
            <YAxis stroke="#4b5563" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorCalories)"
              name="Calories"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Macro Breakdown Chart ─── */}
      <div className="glass glass-card-hover rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-bold text-white mb-5 font-display">Macro Breakdown by Day</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" stroke="#4b5563" fontSize={11} />
            <YAxis stroke="#4b5563" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'var(--font-sans)' }} />
            <Bar dataKey="protein" name="Protein" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carbs" name="Carbs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fat" name="Fat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Deficiency Patterns ─── */}
      {deficiencies && deficiencies.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Deficiency Patterns
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {deficiencies.map((d, i) => (
              <div
                key={i}
                className={`glass glass-card-hover rounded-2xl p-5 border border-white/5 border-l-4 ${
                  d.severity === 'critical'
                    ? 'border-l-rose-500'
                    : d.severity === 'moderate'
                    ? 'border-l-amber-500'
                    : 'border-l-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-900 font-bold text-sm capitalize font-display">{d.nutrient}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      d.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-700 border-rose-500/10'
                        : d.severity === 'moderate'
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/10'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/10'
                    }`}
                  >
                    {d.severity}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-semibold">
                  {d.current} / {d.recommended} ({d.percentage}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── AI Health Summary ─── */}
      {summary && (
        <div className="glass glass-card-hover rounded-2xl p-6 border border-white/5">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2 font-display">
            <Brain size={18} className="text-purple-400" />
            AI Health Summary
          </h2>
          <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line font-semibold">{summary}</p>
        </div>
      )}
    </div>
  );
}

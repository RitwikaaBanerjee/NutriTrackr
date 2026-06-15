/**
 * Reports Page
 *
 * Weekly health report with charts, nutrient averages,
 * deficiency patterns, AI summary, and PDF download.
 * Styled for light-mode frosted glass aesthetic.
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

const card = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
  borderRadius: '18px',
};

const tooltipStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: '12px',
  color: '#18181b',
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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
      <div className="rounded-xl px-3 py-2 text-xs" style={tooltipStyle}>
        <p style={{ color: '#71717a' }} className="mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>{entry.name}: {Math.round(entry.value)}</p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded-xl w-64" style={{ background: 'rgba(0,0,0,0.04)' }} />
        <div className="rounded-2xl h-20" style={{ ...card, opacity: 0.5 }} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="rounded-2xl h-28" style={{ ...card, opacity: 0.5 }} />)}
        </div>
        <div className="rounded-2xl h-64" style={{ ...card, opacity: 0.5 }} />
      </div>
    );
  }

  if (!report || !report.dailyBreakdown || report.dailyBreakdown.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold flex items-center gap-3 font-display" style={{ color: '#18181b' }}>
          <FileBarChart size={28} style={{ color: '#6366f1' }} />
          Weekly Health Report
        </h1>
        <div className="rounded-2xl p-12 text-center" style={card}>
          <FileBarChart size={48} className="mx-auto mb-4" style={{ color: '#a1a1aa' }} />
          <p className="text-lg mb-2" style={{ color: '#52525b' }}>No data for this period</p>
          <p className="text-sm" style={{ color: '#a1a1aa' }}>Start logging meals to see your weekly report!</p>
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
    <div className="space-y-6 animate-fade-in">
      {/* ─── Page Title ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-3 font-display" style={{ color: '#18181b' }}>
          <FileBarChart size={28} style={{ color: '#6366f1' }} />
          Weekly Health Report
        </h1>
        <button
          id="download-pdf-btn"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 50%, #6366f1 100%)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.2)',
          }}
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
      <div
        className="rounded-xl px-4 py-2 flex items-center gap-2 w-fit"
        style={{ ...card, borderRadius: '12px', padding: '8px 16px' }}
      >
        <Calendar size={14} style={{ color: '#6366f1' }} />
        <span className="text-xs font-semibold" style={{ color: '#52525b' }}>{dateRange}</span>
      </div>

      {/* ─── Nutrient Averages ─── */}
      {averages && (
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase mb-3.5" style={{ color: '#71717a' }}>Daily Averages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {[
              { label: 'Calories', value: averages.calories, rec: 2200, unit: 'kcal' },
              { label: 'Protein', value: averages.protein, rec: 55, unit: 'g' },
              { label: 'Carbs', value: averages.carbs, rec: 275, unit: 'g' },
              { label: 'Fat', value: averages.fat, rec: 60, unit: 'g' },
              { label: 'Iron', value: averages.iron, rec: 19, unit: 'mg' },
            ].map((item) => {
              const pct = Math.round(((item.value || 0) / item.rec) * 100);
              return (
                <div key={item.label} className="rounded-2xl p-5 transition-all duration-300" style={card}>
                  <p className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: '#71717a' }}>{item.label}</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#18181b' }}>{Math.round(item.value || 0)}</p>
                  <p className="text-xs font-medium mb-3" style={{ color: '#a1a1aa' }}>/ {item.rec} {item.unit}</p>
                  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
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

      {/* ─── Calorie Trend Chart ─── */}
      <div className="rounded-2xl p-6" style={card}>
        <h2 className="text-base font-bold mb-5 flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
          <TrendingUp size={18} style={{ color: '#6366f1' }} />
          Calorie Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
            <YAxis stroke="#a1a1aa" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorCalories)" name="Calories" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Macro Breakdown Chart ─── */}
      <div className="rounded-2xl p-6" style={card}>
        <h2 className="text-base font-bold mb-5 font-display" style={{ color: '#18181b' }}>Macro Breakdown by Day</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
            <YAxis stroke="#a1a1aa" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#71717a', fontSize: '11px', fontFamily: 'var(--font-sans)' }} />
            <Bar dataKey="protein" name="Protein" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carbs" name="Carbs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fat" name="Fat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Deficiency Patterns ─── */}
      {deficiencies && deficiencies.length > 0 && (
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase mb-3 flex items-center gap-2" style={{ color: '#71717a' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            Deficiency Patterns
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {deficiencies.map((d, i) => {
              const severityColor = d.severity === 'critical' ? '#ef4444' : d.severity === 'moderate' ? '#f59e0b' : '#eab308';
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5"
                  style={{ ...card, borderLeft: `4px solid ${severityColor}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm capitalize font-display" style={{ color: '#18181b' }}>{d.nutrient}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ color: severityColor, background: `${severityColor}10`, border: `1px solid ${severityColor}18` }}
                    >
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: '#71717a' }}>
                    {d.current} / {d.recommended} ({d.percentage}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── AI Health Summary ─── */}
      {summary && (
        <div className="rounded-2xl p-6" style={card}>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
            <Brain size={18} style={{ color: '#8b5cf6' }} />
            AI Health Summary
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-line font-medium" style={{ color: '#52525b' }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

/**
 * AlertBanner — Displays dismissible health/budget alerts.
 * Color-coded by severity: critical (red), moderate (amber), info (blue).
 * Styled as a sleek sidebar Notifications widget.
 */
import { AlertTriangle, AlertCircle, Info, X, Bell } from 'lucide-react';

const severityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(254,226,226,0.85)', border: 'rgba(239,68,68,0.2)', Icon: AlertTriangle },
  moderate: { color: '#f59e0b', bg: 'rgba(254,243,199,0.85)', border: 'rgba(245,158,11,0.2)', Icon: AlertCircle },
  info: { color: '#3b82f6', bg: 'rgba(219,234,254,0.85)', border: 'rgba(59,130,246,0.2)', Icon: Info },
};

export default function AlertBanner({ alerts = [], onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div
      className="rounded-3xl p-6 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold flex items-center gap-2 font-display" style={{ color: '#18181b' }}>
          <Bell size={16} style={{ color: '#f59e0b' }} />
          Notifications
        </h3>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-orange-100 text-orange-700 border border-orange-200/50">
          {alerts.length} New
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          const { Icon } = config;

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-2xl animate-slide-in relative group shadow-sm"
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="mt-0.5 shrink-0 bg-white/70 p-1.5 rounded-xl shadow-sm">
                <Icon size={14} style={{ color: config.color }} strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-semibold leading-snug flex-1" style={{ color: config.color }}>
                {alert.message}
              </p>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(index)}
                  className="transition-colors p-1.5 cursor-pointer rounded-xl bg-white/40 hover:bg-white/90 shrink-0 border border-transparent hover:border-white/50"
                  style={{ color: config.color }}
                  title="Dismiss alert"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

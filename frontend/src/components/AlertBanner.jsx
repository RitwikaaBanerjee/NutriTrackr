/**
 * AlertBanner — Displays dismissible health/budget alerts.
 * Color-coded by severity: critical (red), moderate (amber), info (blue).
 * Styled for light-mode frosted glass aesthetic.
 */
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const severityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(254,226,226,0.6)', border: 'rgba(239,68,68,0.15)', Icon: AlertTriangle },
  moderate: { color: '#f59e0b', bg: 'rgba(254,243,199,0.6)', border: 'rgba(245,158,11,0.15)', Icon: AlertCircle },
  info: { color: '#3b82f6', bg: 'rgba(219,234,254,0.6)', border: 'rgba(59,130,246,0.15)', Icon: Info },
};

export default function AlertBanner({ alerts = [], onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const { Icon } = config;

        return (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-in"
            style={{
              background: config.bg,
              border: `1px solid ${config.border}`,
              backdropFilter: 'blur(12px)',
              animationDelay: `${index * 100}ms`,
            }}
          >
            <Icon size={18} className="shrink-0" style={{ color: config.color }} />
            <p className="text-sm flex-1 font-medium" style={{ color: config.color }}>{alert.message}</p>
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="transition-colors p-1 cursor-pointer"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#52525b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * AlertBanner — Displays dismissible health/budget alerts.
 * Color-coded by severity: critical (red), moderate (amber), info (blue).
 *
 * Props: { alerts, onDismiss }
 */
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

// Map severity to styles and icons
const severityConfig = {
  critical: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    Icon: AlertTriangle,
  },
  moderate: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-400',
    Icon: Info,
  },
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} animate-slide-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Icon size={18} className={`${config.text} shrink-0`} />
            <p className={`text-sm flex-1 ${config.text}`}>{alert.message}</p>
            {onDismiss && (
              <button
                onClick={() => onDismiss(index)}
                className="text-gray-500 hover:text-white transition-colors p-1"
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

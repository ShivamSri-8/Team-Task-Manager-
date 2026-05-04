const StatCard = ({ title, value, icon: Icon, color = 'red', subtitle, large = false }) => {
  const themes = {
    red:    {
      iconBg: 'rgba(239,35,60,0.1)',
      iconColor: '#ef233c',
      border: 'rgba(239,35,60,0.15)',
      glow: 'rgba(239,35,60,0.08)',
      valueColor: '#ff4d6d',
      dot: '#ef233c',
    },
    blue:   {
      iconBg: 'rgba(59,130,246,0.1)',
      iconColor: '#60a5fa',
      border: 'rgba(59,130,246,0.15)',
      glow: 'rgba(59,130,246,0.06)',
      valueColor: '#93c5fd',
      dot: '#3b82f6',
    },
    green:  {
      iconBg: 'rgba(34,197,94,0.1)',
      iconColor: '#4ade80',
      border: 'rgba(34,197,94,0.15)',
      glow: 'rgba(34,197,94,0.06)',
      valueColor: '#86efac',
      dot: '#22c55e',
    },
    yellow: {
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#fbbf24',
      border: 'rgba(245,158,11,0.15)',
      glow: 'rgba(245,158,11,0.06)',
      valueColor: '#fcd34d',
      dot: '#f59e0b',
    },
    gray:   {
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#9ca3af',
      border: 'rgba(255,255,255,0.08)',
      glow: 'rgba(255,255,255,0.02)',
      valueColor: '#e5e7eb',
      dot: '#6b7280',
    },
  };

  const t = themes[color] || themes.gray;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 cursor-default group animate-fade-in"
      style={{
        background: `rgba(255,255,255,0.03)`,
        border: `1px solid ${t.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 24px ${t.glow}, 0 0 0 1px ${t.border}`;
        e.currentTarget.style.borderColor = t.border.replace('0.15', '0.35');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)`;
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      {/* Background glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${t.glow.replace('0.06', '0.3')} 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          {/* Dot + title */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.dot }} />
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest truncate">{title}</p>
          </div>

          {/* Value */}
          <p className={`font-bold mb-1 ${large ? 'text-5xl' : 'text-3xl'}`}
            style={{ color: t.valueColor, lineHeight: 1 }}>
            {value}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-gray-500 text-xs mt-2 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Icon */}
        <div className="rounded-xl p-2.5 shrink-0"
          style={{
            background: t.iconBg,
            border: `1px solid ${t.border}`,
          }}>
          <Icon className="w-5 h-5" style={{ color: t.iconColor }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

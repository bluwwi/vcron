interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "danger" | "warning" | "success" | "info";
  icon?: React.ReactNode;
}

const accentStyles = {
  default: { text: "text-text", bg: "bg-surface-2" },
  danger: { text: "text-danger", bg: "bg-danger-dim" },
  warning: { text: "text-warning", bg: "bg-warning-dim" },
  success: { text: "text-success", bg: "bg-success-dim" },
  info: { text: "text-info", bg: "bg-info-dim" },
};

export function StatCard({ label, value, accent = "default", icon }: StatCardProps) {
  const s = accentStyles[accent];
  return (
    <div className="group rounded-xl border border-border bg-surface p-4 hover:border-border-hover transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-text-dim">{label}</p>
        {icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg} ${s.text}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold tabular-nums ${s.text}`}>{value}</p>
    </div>
  );
}

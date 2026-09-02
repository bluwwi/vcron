interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "danger" | "warning" | "success";
}

const accentColors = {
  default: "text-accent",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-border-hover transition-colors">
      <p className="text-xs uppercase tracking-wider text-text-dim mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accentColors[accent]}`}>{value}</p>
    </div>
  );
}

export default function StatCard({ label, value, sub, icon: Icon, accent = "ink" }) {
  const accentMap = {
    ink: "text-ink bg-ink/5",
    amber: "text-amber-600 bg-amber-100",
    teal: "text-teal bg-teal-100",
    rust: "text-rust bg-rust-100",
  };
  return (
    <div className="rounded border border-slate-200 bg-panel p-4 shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
        {Icon && (
          <span className={`rounded p-1.5 ${accentMap[accent]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-3 font-display font-tnum text-2xl font-semibold text-slate-950">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

const variants = {
  primary:
    "bg-ink text-paper hover:bg-ink-600 border border-ink disabled:opacity-50",
  amber:
    "bg-amber text-ink hover:bg-amber-600 border border-amber disabled:opacity-50",
  ghost:
    "bg-transparent text-slate-950 hover:bg-slate-200/60 border border-slate-200",
  danger:
    "bg-rust text-white hover:bg-rust/90 border border-rust disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded px-3.5 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

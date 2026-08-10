import { Menu } from "lucide-react";

export default function Topbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-paper/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded border border-slate-200 p-1.5 text-slate-500 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-slate-950">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-panel py-1 pl-1 pr-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-medium text-paper">
          AD
        </span>
        <span className="hidden text-sm text-slate-950 sm:inline">Admin</span>
      </div>
    </header>
  );
}

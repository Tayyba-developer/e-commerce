import { Inbox, AlertTriangle } from "lucide-react";

export function LoadingState({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 rounded bg-slate-200/70" />
      ))}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Inbox size={28} className="text-slate-400" />
      <p className="font-display font-medium text-slate-950">{title}</p>
      {message && <p className="max-w-xs text-sm text-slate-400">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <AlertTriangle size={28} className="text-rust" />
      <p className="font-display font-medium text-slate-950">
        Couldn't load this
      </p>
      <p className="max-w-xs text-sm text-slate-400">
        {message || "Check that the API server is running and try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-200/60"
        >
          Retry
        </button>
      )}
    </div>
  );
}

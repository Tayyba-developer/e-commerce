import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { LoadingState, EmptyState, ErrorState } from "./States.jsx";

const PAGE_SIZE = 10;

/**
 * columns: [{ key, header, render?(row) }]
 * rows: array of objects
 * searchKeys: which fields free-text search matches against
 */
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  searchKeys = [],
  searchPlaceholder = "Search…",
  filters, // optional extra filter controls rendered next to search
  emptyMessage = "No records match your filters.",
  rowKey = "id",
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded border border-slate-200 bg-panel shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        {searchKeys.length > 0 && (
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded border border-slate-200 bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-ink"
            />
          </div>
        )}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No results" message={emptyMessage} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-medium">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row[rowKey]}
                    className="border-b border-slate-200/70 last:border-0 hover:bg-paper"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 align-middle text-slate-950">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400">
            <span>
              Showing{" "}
              <span className="font-tnum text-slate-950">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-tnum text-slate-950">{filtered.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="rounded border border-slate-200 p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-tnum px-1">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="rounded border border-slate-200 p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

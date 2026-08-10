import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { api, ReviewsAPI } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import DataTable from "../components/DataTable.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < value ? "fill-amber text-amber" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const toast = useToast();
  // All reviews across products — backed by a dedicated read endpoint on
  // top of the same Reviews table used by /products/:id/reviews.
  const { data: reviews, loading, error, reload } = useApi(
    () => api.get("/reviews").then((r) => r.data),
    []
  );
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function handleDelete(review) {
    try {
      await ReviewsAPI.remove(review.id);
      toast.success("Review deleted.");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: "productName", header: "Product" },
    { key: "customerName", header: "Customer" },
    { key: "rating", header: "Rating", render: (r) => <Stars value={r.rating} /> },
    { key: "comment", header: "Comment", render: (r) => (
        <p className="max-w-xs truncate text-slate-500">{r.comment}</p>
      ) },
    { key: "date", header: "Date", render: (r) => <span className="font-mono text-xs text-slate-500">{r.date}</span> },
    { key: "actions", header: "", render: (r) => (
        <button
          onClick={() => setConfirmDelete(r)}
          aria-label="Delete review"
          className="rounded p-1.5 text-slate-500 hover:bg-rust-100 hover:text-rust"
        >
          <Trash2 size={15} />
        </button>
      ) },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={reviews}
        loading={loading}
        error={error}
        onRetry={reload}
        searchKeys={["productName", "customerName", "comment"]}
        searchPlaceholder="Search reviews…"
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete review"
        message="This removes the review permanently."
        onConfirm={() => handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

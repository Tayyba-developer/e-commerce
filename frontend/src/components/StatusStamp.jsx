const styles = {
  // orders
  delivered: "border-teal text-teal bg-teal-100",
  shipped: "border-amber-600 text-amber-600 bg-amber-100",
  processing: "border-slate-400 text-slate-500 bg-slate-200/50",
  cancelled: "border-rust text-rust bg-rust-100",
  pending: "border-slate-400 text-slate-500 bg-slate-200/50",
  // stock
  "in stock": "border-teal text-teal bg-teal-100",
  "low stock": "border-amber-600 text-amber-600 bg-amber-100",
  "out of stock": "border-rust text-rust bg-rust-100",
  // payments
  paid: "border-teal text-teal bg-teal-100",
  failed: "border-rust text-rust bg-rust-100",
  refunded: "border-slate-400 text-slate-500 bg-slate-200/50",
};

export default function StatusStamp({ value }) {
  const key = String(value || "").toLowerCase();
  const cls = styles[key] || "border-slate-400 text-slate-500 bg-slate-200/50";
  return <span className={`stamp ${cls}`}>{value}</span>;
}

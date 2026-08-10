import { useState } from "react";
import { Eye } from "lucide-react";
import { useApi } from "../hooks/useApi.js";
import { OrdersAPI } from "../services/api.js";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import { LoadingState, ErrorState } from "../components/States.jsx";

export default function Orders() {
  const { data: orders, loading, error, reload } = useApi(OrdersAPI.list, []);
  const [selectedId, setSelectedId] = useState(null);
  const detail = useApi(
    () => (selectedId ? OrdersAPI.get(selectedId) : Promise.resolve(null)),
    [selectedId]
  );

  const columns = [
    { key: "id", header: "Order", render: (r) => (
        <span className="font-mono text-slate-950">#{String(r.id).padStart(5, "0")}</span>
      ) },
    { key: "customerName", header: "Customer" },
    { key: "date", header: "Order Date", render: (r) => (
        <span className="font-mono text-xs text-slate-500">{r.date}</span>
      ) },
    { key: "total", header: "Total", render: (r) => (
        <span className="font-mono font-tnum">${Number(r.total).toFixed(2)}</span>
      ) },
    { key: "status", header: "Status", render: (r) => <StatusStamp value={r.status} /> },
    { key: "actions", header: "", render: (r) => (
        <button
          onClick={() => setSelectedId(r.id)}
          className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-950"
        >
          <Eye size={13} /> View
        </button>
      ) },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        error={error}
        onRetry={reload}
        searchKeys={["customerName", "id", "status"]}
        searchPlaceholder="Search by customer, order #, status…"
      />

      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={`Order #${String(selectedId).padStart(5, "0")}`}
      >
        {detail.loading ? (
          <LoadingState rows={3} />
        ) : detail.error ? (
          <ErrorState message={detail.error.message} onRetry={detail.reload} />
        ) : (
          detail.data && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-medium text-slate-950">{detail.data.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <StatusStamp value={detail.data.status} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Order date</p>
                  <p className="font-mono">{detail.data.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment</p>
                  <StatusStamp value={detail.data.paymentStatus} />
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Items</p>
                <div className="divide-y divide-slate-200 rounded border border-slate-200">
                  {detail.data.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2">
                      <span>{item.productName} <span className="font-mono text-xs text-slate-400">×{item.quantity}</span></span>
                      <span className="font-mono font-tnum">${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Order total</p>
                  <p className="font-mono font-tnum text-lg font-semibold">${Number(detail.data.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}

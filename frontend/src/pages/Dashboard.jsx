import {
  Users2,
  Package,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useApi } from "../hooks/useApi.js";
import { DashboardAPI } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";

const PIE_COLORS = ["#E8A33D", "#1F6F63", "#14161F", "#C1462F", "#8A8D9F", "#C98420"];

function currency(n) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard() {
  const summary = useApi(DashboardAPI.summary, []);
  const monthly = useApi(DashboardAPI.monthlySales, []);
  const topProducts = useApi(DashboardAPI.topProducts, []);
  const categorySales = useApi(DashboardAPI.categorySales, []);
  const recentOrders = useApi(DashboardAPI.recentOrders, []);

  const s = summary.data;

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={summary.loading ? "…" : s?.totalUsers ?? "—"}
          sub="Registered customers"
          icon={Users2}
          accent="ink"
        />
        <StatCard
          label="Total Products"
          value={summary.loading ? "…" : s?.totalProducts ?? "—"}
          sub={`${s?.outOfStockCount ?? 0} out of stock`}
          icon={Package}
          accent="amber"
        />
        <StatCard
          label="Total Orders"
          value={summary.loading ? "…" : s?.totalOrders ?? "—"}
          sub="All-time orders"
          icon={ShoppingBag}
          accent="teal"
        />
        <StatCard
          label="Total Revenue"
          value={summary.loading ? "…" : currency(s?.totalRevenue)}
          sub={`Avg rating ${s?.avgRating ?? "—"} / 5`}
          icon={DollarSign}
          accent="rust"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded border border-slate-200 bg-panel p-4 shadow-card lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-slate-950">
            Monthly Sales
          </h3>
          <p className="mb-3 text-xs text-slate-400">Revenue by month, computed from Orders + Payments</p>
          {monthly.loading ? (
            <LoadingState rows={4} />
          ) : monthly.error ? (
            <ErrorState message={monthly.error.message} onRetry={monthly.reload} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly.data}>
                <CartesianGrid stroke="#E4E2DA" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8A8D9F" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8A8D9F" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => currency(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E4E2DA", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#E8A33D" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-panel p-4 shadow-card">
          <h3 className="font-display text-sm font-semibold text-slate-950">
            Sales by Category
          </h3>
          <p className="mb-3 text-xs text-slate-400">Share of revenue</p>
          {categorySales.loading ? (
            <LoadingState rows={4} />
          ) : categorySales.error ? (
            <ErrorState message={categorySales.error.message} onRetry={categorySales.reload} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categorySales.data}
                  dataKey="revenue"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {categorySales.data?.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E4E2DA", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded border border-slate-200 bg-panel p-4 shadow-card lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-slate-950">
            Top Selling Products
          </h3>
          <p className="mb-3 text-xs text-slate-400">By units sold (Order_Items)</p>
          {topProducts.loading ? (
            <LoadingState rows={4} />
          ) : topProducts.error ? (
            <ErrorState message={topProducts.error.message} onRetry={topProducts.reload} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts.data} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="#E4E2DA" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#8A8D9F" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 12, fill: "#2B2D3A" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E4E2DA", fontSize: 12 }} />
                <Bar dataKey="unitsSold" fill="#1F6F63" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-panel shadow-card">
          <h3 className="px-4 pt-4 font-display text-sm font-semibold text-slate-950">
            Recent Orders
          </h3>
          <p className="mb-2 px-4 text-xs text-slate-400">Latest activity</p>
          {recentOrders.loading ? (
            <LoadingState rows={5} />
          ) : recentOrders.error ? (
            <ErrorState message={recentOrders.error.message} onRetry={recentOrders.reload} />
          ) : recentOrders.data?.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <ul className="divide-y divide-slate-200/70">
              {recentOrders.data?.map((o) => (
                <li key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-950">{o.customerName}</p>
                    <p className="font-mono text-xs text-slate-400">
                      #{o.id} · {o.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-tnum font-mono text-sm text-slate-950">{currency(o.total)}</p>
                    <StatusStamp value={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

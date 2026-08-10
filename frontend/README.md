# Frontend — E-Commerce Management Dashboard

React (Vite) + Tailwind admin dashboard for the E-Commerce Management System.

## Design direction

"Ledger" — a commerce-ops control room, not a generic purple SaaS template.

- **Palette:** Ink `#14161F` (sidebar), Paper `#F7F5EF` (canvas), Amber `#E8A33D` (primary actions), Teal `#1F6F63` (positive/in-stock), Rust `#C1462F` (danger/out-of-stock).
- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (prices, IDs, dates, quantities — tabular figures throughout, like a ledger).
- **Signature element:** rotated "stamp" badges for order/stock/payment status instead of generic colored pills.

## Run it

```bash
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:4000` by default (see `vite.config.js`). That's where the reference server in `../server` runs — start it first (`cd ../server && npm install && npm start`), or point the proxy at your real Express + SQL backend from Phase 9 by setting `VITE_API_PROXY_TARGET`.

No frontend code needs to change to switch backends — every page talks only to `/api/...` via `src/services/api.js`, matching the REST contract from Phase 9 exactly.

## Structure

```
src/
├── components/   # Reusable UI: DataTable, Modal, Toast, StatCard, StatusStamp...
├── pages/        # Dashboard, Products, Orders, Users, Categories, Reviews
├── layouts/      # DashboardLayout (sidebar + topbar shell)
├── services/     # api.js — the only place that knows about HTTP
└── hooks/        # useApi.js — loading/error/data pattern shared by every page
```

## Notes

- Every dashboard stat and chart is computed server-side from real data — nothing is hardcoded in the frontend.
- Loading, empty, and error states are handled for every list/table.
- Fully responsive: sidebar collapses to a drawer below `lg`, tables scroll horizontally on small screens.

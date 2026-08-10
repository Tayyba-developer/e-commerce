# Reference API Server (temporary)

This is **not** the Phase 9 backend — it's a small Express server with realistic in-memory data that implements the *exact same* REST contract, so the frontend has something real to talk to right away.

```bash
npm install
npm start   # listens on http://localhost:4000
```

When your real Express + SQL backend (controllers/routes/services from Phase 9, backed by `schema.sql` + `seed.sql`) is ready, either:

1. Run it on port 4000 instead of this file, or
2. Run it elsewhere and set `VITE_API_PROXY_TARGET` when starting the frontend.

The frontend never needs to change — it only knows about `/api/...` routes.

## Routes implemented

Matches Section 9 of the project spec: `/api/users`, `/api/products`, `/api/categories`, `/api/orders`, `/api/products/:id/reviews`, `/api/reviews/:id`, plus `/api/dashboard/*` aggregate endpoints (summary, monthly-sales, top-products, category-sales, recent-orders) that the real backend should implement with SQL `GROUP BY` / `JOIN` queries (see `database/queries.sql` from Phase 5).

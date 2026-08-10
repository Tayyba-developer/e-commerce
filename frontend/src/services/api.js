import axios from "axios";

// All requests go through /api — Vite proxies this to whatever backend is
// running (see vite.config.js). Swap VITE_API_PROXY_TARGET when the real
// Express + SQL backend from Phase 9 is ready; no frontend code changes.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong talking to the server.";
    return Promise.reject(new Error(message));
  }
);

// ---- Users ----------------------------------------------------------
export const UsersAPI = {
  list: (params) => api.get("/users", { params }).then((r) => r.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data) => api.post("/users", data).then((r) => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

// ---- Products ---------------------------------------------------------
export const ProductsAPI = {
  list: (params) => api.get("/products", { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

// ---- Categories -------------------------------------------------------
export const CategoriesAPI = {
  list: () => api.get("/categories").then((r) => r.data),
  create: (data) => api.post("/categories", data).then((r) => r.data),
  update: (id, data) =>
    api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

// ---- Orders -------------------------------------------------------------
export const OrdersAPI = {
  list: (params) => api.get("/orders", { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post("/orders", data).then((r) => r.data),
};

// ---- Reviews ------------------------------------------------------------
export const ReviewsAPI = {
  listForProduct: (productId) =>
    api.get(`/products/${productId}/reviews`).then((r) => r.data),
  create: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

// ---- Dashboard (aggregate stats — computed server-side, never hardcoded) --
export const DashboardAPI = {
  summary: () => api.get("/dashboard/summary").then((r) => r.data),
  monthlySales: () => api.get("/dashboard/monthly-sales").then((r) => r.data),
  topProducts: () => api.get("/dashboard/top-products").then((r) => r.data),
  categorySales: () =>
    api.get("/dashboard/category-sales").then((r) => r.data),
  recentOrders: () => api.get("/dashboard/recent-orders").then((r) => r.data),
};

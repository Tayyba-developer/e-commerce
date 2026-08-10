import express from "express";
import cors from "cors";
import { db } from "./data.js";
import {
  isSupabaseEnabled,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  getOrderById,
  createOrder,
  listReviews,
  listReviewsForProduct,
  createReview,
  deleteReview,
  dashboardSummary,
  dashboardMonthlySales,
  dashboardTopProducts,
  dashboardCategorySales,
  dashboardRecentOrders,
} from "./supabaseService.js";

const app = express();
app.use(cors());
app.use(express.json());

const nextId = (arr) => (arr.length ? Math.max(...arr.map((r) => r.id)) + 1 : 1);

function notFound(res, what) {
  return res.status(404).json({ message: `${what} not found` });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const supabaseEnabled = isSupabaseEnabled;

// ---------------------------------------------------------------- Users --
app.get(
  "/api/users",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listUsers());
      return;
    }
    res.json(db.users);
  })
);

app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const user = await getUserById(Number(req.params.id));
      if (!user) return notFound(res, "User");
      res.json(user);
      return;
    }
    const user = db.users.find((u) => u.id === Number(req.params.id));
    if (!user) return notFound(res, "User");
    res.json(user);
  })
);

app.post(
  "/api/users",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const user = await createUser(req.body);
      res.status(201).json(user);
      return;
    }
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required." });
    if (db.users.some((u) => u.email === email)) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }
    const user = {
      id: nextId(db.users),
      name,
      email,
      phone: phone || "",
      joined: new Date().toISOString().slice(0, 10),
      ordersCount: 0,
    };
    db.users.push(user);
    res.status(201).json(user);
  })
);

app.put(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const user = await updateUser(Number(req.params.id), req.body);
      if (!user) return notFound(res, "User");
      res.json(user);
      return;
    }
    const user = db.users.find((u) => u.id === Number(req.params.id));
    if (!user) return notFound(res, "User");
    Object.assign(user, req.body);
    res.json(user);
  })
);

app.delete(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      await deleteUser(Number(req.params.id));
      res.status(204).end();
      return;
    }
    const idx = db.users.findIndex((u) => u.id === Number(req.params.id));
    if (idx === -1) return notFound(res, "User");
    db.users.splice(idx, 1);
    res.status(204).end();
  })
);

// ------------------------------------------------------------ Products --
app.get(
  "/api/products",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listProducts());
      return;
    }
    res.json(db.products);
  })
);

app.get(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const product = await getProductById(Number(req.params.id));
      if (!product) return notFound(res, "Product");
      res.json(product);
      return;
    }
    const product = db.products.find((p) => p.id === Number(req.params.id));
    if (!product) return notFound(res, "Product");
    res.json(product);
  })
);

app.post(
  "/api/products",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const product = await createProduct(req.body);
      res.status(201).json(product);
      return;
    }
    const { name, category_id, price, stock, description } = req.body;
    if (!name || !category_id || price == null || stock == null) {
      return res.status(400).json({ message: "Name, category, price and stock are required." });
    }
    if (price < 0) return res.status(400).json({ message: "Invalid price." });
    const category = db.categories.find((c) => c.id === Number(category_id));
    if (!category) return res.status(400).json({ message: "Category not found." });
    const product = {
      id: nextId(db.products),
      name,
      category_id: Number(category_id),
      category_name: category.name,
      price: Number(price),
      stock: Number(stock),
      description: description || "",
    };
    db.products.push(product);
    res.status(201).json(product);
  })
);

app.put(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const product = await updateProduct(Number(req.params.id), req.body);
      if (!product) return notFound(res, "Product");
      res.json(product);
      return;
    }
    const product = db.products.find((p) => p.id === Number(req.params.id));
    if (!product) return notFound(res, "Product");
    const updates = { ...req.body };
    if (updates.category_id) {
      const category = db.categories.find((c) => c.id === Number(updates.category_id));
      if (!category) return res.status(400).json({ message: "Category not found." });
      updates.category_id = Number(updates.category_id);
      updates.category_name = category.name;
    }
    Object.assign(product, updates);
    res.json(product);
  })
);

app.delete(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      await deleteProduct(Number(req.params.id));
      res.status(204).end();
      return;
    }
    const idx = db.products.findIndex((p) => p.id === Number(req.params.id));
    if (idx === -1) return notFound(res, "Product");
    db.products.splice(idx, 1);
    res.status(204).end();
  })
);

// ---------------------------------------------------------- Categories --
app.get(
  "/api/categories",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listCategories());
      return;
    }
    res.json(db.categories);
  })
);

app.post(
  "/api/categories",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const category = await createCategory(req.body);
      res.status(201).json(category);
      return;
    }
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required." });
    const category = { id: nextId(db.categories), name, productCount: 0 };
    db.categories.push(category);
    res.status(201).json(category);
  })
);

app.put(
  "/api/categories/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const category = await updateCategory(Number(req.params.id), req.body);
      if (!category) return notFound(res, "Category");
      res.json(category);
      return;
    }
    const category = db.categories.find((c) => c.id === Number(req.params.id));
    if (!category) return notFound(res, "Category");
    Object.assign(category, req.body);
    res.json(category);
  })
);

app.delete(
  "/api/categories/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      await deleteCategory(Number(req.params.id));
      res.status(204).end();
      return;
    }
    const idx = db.categories.findIndex((c) => c.id === Number(req.params.id));
    if (idx === -1) return notFound(res, "Category");
    db.categories.splice(idx, 1);
    res.status(204).end();
  })
);

// -------------------------------------------------------------- Orders --
app.get(
  "/api/orders",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listOrders());
      return;
    }
    res.json(db.orders.map(({ items, ...rest }) => rest));
  })
);

app.get(
  "/api/orders/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const order = await getOrderById(Number(req.params.id));
      if (!order) return notFound(res, "Order");
      res.json(order);
      return;
    }
    const order = db.orders.find((o) => o.id === Number(req.params.id));
    if (!order) return notFound(res, "Order");
    res.json(order);
  })
);

app.post(
  "/api/orders",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const order = await createOrder(req.body);
      res.status(201).json(order);
      return;
    }
    const { user_id, items } = req.body;
    const user = db.users.find((u) => u.id === Number(user_id));
    if (!user) return res.status(400).json({ message: "Invalid user." });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item." });
    }
    let total = 0;
    const orderItems = items.map((it) => {
      const product = db.products.find((p) => p.id === Number(it.product_id));
      if (!product) throw new Error("Invalid product in order.");
      const subtotal = Number((product.price * it.quantity).toFixed(2));
      total += subtotal;
      return { id: db.orderItems.length + 1, product_id: product.id, productName: product.name, quantity: it.quantity, subtotal };
    });
    const order = {
      id: nextId(db.orders),
      user_id: user.id,
      customerName: user.name,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      paymentStatus: "Pending",
      total: Number(total.toFixed(2)),
      items: orderItems,
    };
    db.orders.push(order);
    res.status(201).json(order);
  })
);

// ------------------------------------------------------------- Reviews --
app.get(
  "/api/reviews",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listReviews());
      return;
    }
    res.json(db.reviews);
  })
);

app.get(
  "/api/products/:id/reviews",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await listReviewsForProduct(Number(req.params.id)));
      return;
    }
    res.json(db.reviews.filter((r) => r.product_id === Number(req.params.id)));
  })
);

app.post(
  "/api/products/:id/reviews",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      const review = await createReview(Number(req.params.id), req.body);
      res.status(201).json(review);
      return;
    }
    const product = db.products.find((p) => p.id === Number(req.params.id));
    if (!product) return notFound(res, "Product");
    const { user_id, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Invalid rating." });
    const user = db.users.find((u) => u.id === Number(user_id));
    const review = {
      id: nextId(db.reviews),
      product_id: product.id,
      productName: product.name,
      user_id: user?.id || null,
      customerName: user?.name || "Anonymous",
      rating: Number(rating),
      comment: comment || "",
      date: new Date().toISOString().slice(0, 10),
    };
    db.reviews.push(review);
    res.status(201).json(review);
  })
);

app.delete(
  "/api/reviews/:id",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      await deleteReview(Number(req.params.id));
      res.status(204).end();
      return;
    }
    const idx = db.reviews.findIndex((r) => r.id === Number(req.params.id));
    if (idx === -1) return notFound(res, "Review");
    db.reviews.splice(idx, 1);
    res.status(204).end();
  })
);

// ----------------------------------------------------- Dashboard stats --
app.get(
  "/api/dashboard/summary",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await dashboardSummary());
      return;
    }
    const totalRevenue = db.payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const ratings = db.reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    res.json({
      totalUsers: db.users.length,
      totalProducts: db.products.length,
      totalOrders: db.orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      outOfStockCount: db.products.filter((p) => p.stock === 0).length,
      avgRating: Number(avgRating.toFixed(1)),
    });
  })
);

app.get(
  "/api/dashboard/monthly-sales",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await dashboardMonthlySales());
      return;
    }
    const byMonth = {};
    db.orders.forEach((o) => {
      const key = o.date.slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + o.total;
    });
    const sorted = Object.keys(byMonth).sort();
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    res.json(
      sorted.map((key) => ({
        month: monthLabels[Number(key.slice(5, 7)) - 1],
        revenue: Number(byMonth[key].toFixed(2)),
      }))
    );
  })
);

app.get(
  "/api/dashboard/top-products",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await dashboardTopProducts());
      return;
    }
    const unitsByProduct = {};
    db.orderItems.forEach((item) => {
      unitsByProduct[item.product_id] = (unitsByProduct[item.product_id] || 0) + item.quantity;
    });
    const ranked = Object.entries(unitsByProduct)
      .map(([productId, unitsSold]) => {
        const product = db.products.find((p) => p.id === Number(productId));
        return { name: product?.name || "Unknown", unitsSold };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
    res.json(ranked);
  })
);

app.get(
  "/api/dashboard/category-sales",
  asyncHandler(async (req, res) => {
    if (supabaseEnabled) {
      res.json(await dashboardCategorySales());
      return;
    }
    const revenueByCategory = {};
    db.orderItems.forEach((item) => {
      const product = db.products.find((p) => p.id === item.product_id);
      if (!product) return;
      revenueByCategory[product.category_name] = (revenueByCategory[product.category_name] || 0) + item.subtotal;
    });
    res.json(
      Object.entries(revenueByCategory)
        .map(([category, revenue]) => ({ category, revenue: Number(revenue.toFixed(2)) }))
        .sort((a, b) => b.revenue - a.revenue)
    );
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', backend: 'running on 4000', supabase: 'connected' });
});

app.get('/', (req, res) => {
  res.send('E-Commerce Backend is Working!');
});

// ------------------------------------------------------------ fallback --
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Reference API server running at http://localhost:${port}`);
    console.log(`Replace this with the real Express + SQL backend when ready.`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort} instead...`);
      startServer(nextPort);
      return;
    }

    console.error(err);
    process.exit(1);
  });
}

const requestedPort = Number(process.env.PORT || 4000);
startServer(requestedPort);

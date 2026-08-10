import { randomUUID } from "node:crypto";
import { supabase, isSupabaseEnabled } from "./supabaseClient.js";

const isEnabled = isSupabaseEnabled;

const dateString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const mapUser = (row, ordersCount = 0) => ({
  id: row.user_id,
  name: row.full_name,
  email: row.email,
  phone: row.phone || "",
  joined: dateString(row.created_at),
  ordersCount,
});

const mapCategory = (row, productCount = 0) => ({
  id: row.category_id,
  name: row.name,
  description: row.description || "",
  productCount,
});

const mapProduct = (row) => ({
  id: row.product_id,
  name: row.name,
  category_id: row.category_id,
  category_name: row.categories?.[0]?.name || "",
  price: Number(row.price ?? 0),
  stock: Number(row.stock_quantity ?? 0),
  description: row.description || "",
});

const mapOrderItem = (row) => ({
  id: row.order_item_id,
  order_id: row.order_id,
  product_id: row.product_id,
  productName: row.products?.[0]?.name || "",
  quantity: row.quantity,
  subtotal: Number((row.unit_price ?? 0) * (row.quantity ?? 0)),
});

const mapOrder = (row, paymentStatus = "Pending", items = []) => ({
  id: row.order_id,
  user_id: row.user_id,
  customerName: row.users?.[0]?.full_name || row.customerName || "",
  date: dateString(row.order_date),
  status: row.status,
  paymentStatus,
  total: Number(row.total_amount ?? 0),
  items,
});

const mapReview = (row) => ({
  id: row.review_id,
  product_id: row.product_id,
  productName: row.products?.[0]?.name || "",
  user_id: row.user_id,
  customerName: row.users?.[0]?.full_name || "Anonymous",
  rating: Number(row.rating ?? 0),
  comment: row.comment || "",
  date: dateString(row.review_date),
});

const throwIfError = (result) => {
  if (result.error) throw result.error;
  return result.data;
};

const countOrdersPerUser = (orders) => {
  const counts = {};
  (orders || []).forEach((order) => {
    counts[order.user_id] = (counts[order.user_id] || 0) + 1;
  });
  return counts;
};

const countProductsPerCategory = (products) => {
  const counts = {};
  (products || []).forEach((product) => {
    counts[product.category_id] = (counts[product.category_id] || 0) + 1;
  });
  return counts;
};

const getPaymentStatusMap = (payments) => {
  const map = {};
  (payments || []).forEach((payment) => {
    map[payment.order_id] = payment.payment_status;
  });
  return map;
};

const asyncSingleRow = async (query) => {
  const { data, error } = await query;
  if (error && error.code !== "PGRST116") throw error;
  return data;
};

export async function listUsers() {
  const users = await throwIfError(supabase.from("users").select("*") );
  const orders = await throwIfError(supabase.from("orders").select("user_id") );
  const counts = countOrdersPerUser(orders);
  return users.map((row) => mapUser(row, counts[row.user_id] || 0));
}

export async function getUserById(id) {
  const user = await throwIfError(
    supabase.from("users").select("*").eq("user_id", id).single()
  );
  if (!user) return null;
  const orders = await throwIfError(
    supabase.from("orders").select("user_id").eq("user_id", id)
  );
  return mapUser(user, orders.length);
}

export async function createUser(data) {
  const user = await throwIfError(
    supabase
      .from("users")
      .insert({
        full_name: data.name,
        email: data.email,
        password_hash: randomUUID(),
        phone: data.phone || "",
      })
      .select("*")
      .single()
  );
  return mapUser(user, 0);
}

export async function updateUser(id, data) {
  const updated = await throwIfError(
    supabase
      .from("users")
      .update({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .eq("user_id", id)
      .select("*")
      .single()
  );
  if (!updated) return null;
  const orders = await throwIfError(
    supabase.from("orders").select("user_id").eq("user_id", id)
  );
  return mapUser(updated, orders.length);
}

export async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("user_id", id);
  if (error) throw error;
  return true;
}

export async function listCategories() {
  const categories = await throwIfError(supabase.from("categories").select("*"));
  const products = await throwIfError(supabase.from("products").select("category_id"));
  const counts = countProductsPerCategory(products);
  return categories.map((row) => mapCategory(row, counts[row.category_id] || 0));
}

export async function createCategory(data) {
  const category = await throwIfError(
    supabase.from("categories").insert({ name: data.name, description: data.description || "" }).select("*").single()
  );
  return mapCategory(category, 0);
}

export async function updateCategory(id, data) {
  const category = await throwIfError(
    supabase
      .from("categories")
      .update({ name: data.name, description: data.description })
      .eq("category_id", id)
      .select("*")
      .single()
  );
  if (!category) return null;
  const products = await throwIfError(
    supabase.from("products").select("category_id").eq("category_id", id)
  );
  return mapCategory(category, products.length);
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("category_id", id);
  if (error) throw error;
  return true;
}

export async function listProducts() {
  const products = await throwIfError(
    supabase.from("products").select("*,categories(name)")
  );
  return products.map(mapProduct);
}

export async function getProductById(id) {
  const product = await throwIfError(
    supabase.from("products").select("*,categories(name)").eq("product_id", id).single()
  );
  return product ? mapProduct(product) : null;
}

export async function createProduct(data) {
  const row = await throwIfError(
    supabase
      .from("products")
      .insert({
        category_id: Number(data.category_id),
        name: data.name,
        description: data.description || "",
        price: Number(data.price),
        stock_quantity: Number(data.stock),
      })
      .select("*,categories(name)")
      .single()
  );
  return mapProduct(row);
}

export async function updateProduct(id, data) {
  const row = await throwIfError(
    supabase
      .from("products")
      .update({
        category_id: data.category_id ? Number(data.category_id) : undefined,
        name: data.name,
        description: data.description,
        price: data.price != null ? Number(data.price) : undefined,
        stock_quantity: data.stock != null ? Number(data.stock) : undefined,
      })
      .eq("product_id", id)
      .select("*,categories(name)")
      .single()
  );
  if (!row) return null;
  return mapProduct(row);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("product_id", id);
  if (error) throw error;
  return true;
}

export async function listOrders() {
  const orders = await throwIfError(supabase.from("orders").select("*"));
  const payments = await throwIfError(supabase.from("payments").select("order_id,payment_status"));
  const paymentMap = getPaymentStatusMap(payments);
  return orders.map((order) => mapOrder(order, paymentMap[order.order_id] || "Pending"));
}

export async function getOrderById(id) {
  const order = await throwIfError(
    supabase.from("orders").select("*,users(full_name)").eq("order_id", id).single()
  );
  if (!order) return null;
  const items = await throwIfError(
    supabase
      .from("order_items")
      .select("*,products(name)")
      .eq("order_id", id)
  );
  const payments = await throwIfError(
    supabase.from("payments").select("payment_status").eq("order_id", id).single()
  );
  return mapOrder(order, payments?.payment_status || "Pending", items.map(mapOrderItem));
}

export async function createOrder(data) {
  const user = await throwIfError(
    supabase.from("users").select("*").eq("user_id", Number(data.user_id)).single()
  );
  if (!user) throw new Error("Invalid user.");
  const productIds = data.items.map((item) => Number(item.product_id));
  const products = await throwIfError(
    supabase.from("products").select("*").in("product_id", productIds)
  );
  if (products.length !== data.items.length) throw new Error("Invalid product in order.");

  const orderTotal = data.items.reduce((sum, item) => {
    const product = products.find((p) => p.product_id === Number(item.product_id));
    return sum + Number(product.price) * Number(item.quantity);
  }, 0);

  const orderRow = await throwIfError(
    supabase
      .from("orders")
      .insert({
        user_id: Number(data.user_id),
        status: "pending",
        total_amount: Number(orderTotal.toFixed(2)),
      })
      .select("*")
      .single()
  );

  const itemsToInsert = data.items.map((item) => {
    const product = products.find((p) => p.product_id === Number(item.product_id));
    return {
      order_id: orderRow.order_id,
      product_id: product.product_id,
      quantity: Number(item.quantity),
      unit_price: Number(product.price),
    };
  });

  const insertedItems = await throwIfError(
    supabase.from("order_items").insert(itemsToInsert).select("*,products(name)")
  );

  await throwIfError(
    supabase.from("payments").insert({
      order_id: orderRow.order_id,
      payment_method: "cash_on_delivery",
      payment_status: "pending",
    })
  );

  const items = insertedItems.map(mapOrderItem);
  return mapOrder(orderRow, "Pending", items);
}

export async function listReviews() {
  const reviews = await throwIfError(
    supabase.from("reviews").select("*,products(name),users(full_name)")
  );
  return reviews.map(mapReview);
}

export async function listReviewsForProduct(productId) {
  const reviews = await throwIfError(
    supabase
      .from("reviews")
      .select("*,products(name),users(full_name)")
      .eq("product_id", Number(productId))
  );
  return reviews.map(mapReview);
}

export async function createReview(productId, data) {
  const review = await throwIfError(
    supabase
      .from("reviews")
      .insert({
        product_id: Number(productId),
        user_id: Number(data.user_id),
        rating: Number(data.rating),
        comment: data.comment || "",
      })
      .select("*,products(name),users(full_name)")
      .single()
  );
  return mapReview(review);
}

export async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("review_id", Number(id));
  if (error) throw error;
  return true;
}

export async function dashboardSummary() {
  const [users, products, orders, payments, reviews] = await Promise.all([
    throwIfError(supabase.from("users").select("*")),
    throwIfError(supabase.from("products").select("*")),
    throwIfError(supabase.from("orders").select("*")),
    throwIfError(supabase.from("payments").select("*")),
    throwIfError(supabase.from("reviews").select("rating")),
  ]);
  const totalRevenue = payments
    .filter((payment) => payment.payment_status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const avgRating = reviews.length ? reviews.reduce((sum, row) => sum + Number(row.rating), 0) / reviews.length : 0;
  const outOfStockCount = products.filter((product) => Number(product.stock_quantity) === 0).length;
  return {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    outOfStockCount,
    avgRating: Number(avgRating.toFixed(1)),
  };
}

export async function dashboardMonthlySales() {
  const orders = await throwIfError(supabase.from("orders").select("order_date,total_amount,status"));
  const byMonth = {};
  orders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      const key = dateString(order.order_date).slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + Number(order.total_amount || 0);
    });
  const sorted = Object.keys(byMonth).sort();
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return sorted.map((key) => ({ month: monthLabels[Number(key.slice(5, 7)) - 1], revenue: Number(byMonth[key].toFixed(2)) }));
}

export async function dashboardTopProducts() {
  const items = await throwIfError(supabase.from("order_items").select("product_id,quantity,products(name)") );
  const unitsByProduct = {};
  items.forEach((item) => {
    unitsByProduct[item.product_id] = (unitsByProduct[item.product_id] || 0) + Number(item.quantity || 0);
  });
  return Object.entries(unitsByProduct)
    .map(([productId, unitsSold]) => ({ name: items.find((item) => item.product_id === Number(productId))?.products?.[0]?.name || "Unknown", unitsSold }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);
}

export async function dashboardCategorySales() {
  const items = await throwIfError(supabase.from("order_items").select("product_id,unit_price,quantity,products(category_id,categories(name))") );
  const revenueByCategory = {};
  items.forEach((item) => {
    const categoryName = item.products?.[0]?.categories?.[0]?.name || "Unknown";
    const subtotal = Number(item.unit_price || 0) * Number(item.quantity || 0);
    revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + subtotal;
  });
  return Object.entries(revenueByCategory)
    .map(([category, revenue]) => ({ category, revenue: Number(revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function dashboardRecentOrders() {
  const orders = await throwIfError(
    supabase.from("orders").select("*,users(full_name)")
  );
  const payments = await throwIfError(
    supabase.from("payments").select("order_id,payment_status")
  );
  const paymentMap = getPaymentStatusMap(payments);
  return orders
    .sort((a, b) => (a.order_date < b.order_date ? 1 : -1))
    .slice(0, 6)
    .map((order) => mapOrder(order, paymentMap[order.order_id] || "Pending"));
}

export { isEnabled as isSupabaseEnabled };

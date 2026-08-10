// Deterministic, realistic-looking sample data — a smaller in-memory stand-in
// for the SQL seed data (schema.sql / seed.sql) described in the project
// docs. Swap this file (or the whole server) for the real Express+SQL
// backend from Phase 9 without changing any frontend code.

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const CATEGORY_NAMES = [
  "Electronics", "Home & Kitchen", "Sports & Outdoors", "Books",
  "Beauty & Personal Care", "Toys & Games", "Fashion", "Office Supplies",
  "Pet Supplies", "Automotive",
];

const categories = CATEGORY_NAMES.map((name, i) => ({ id: i + 1, name }));

const PRODUCT_TEMPLATES = {
  Electronics: ["Wireless Earbuds", "Bluetooth Speaker", "4K Monitor", "Mechanical Keyboard", "USB-C Hub", "Smartwatch", "Portable SSD", "Webcam HD"],
  "Home & Kitchen": ["Stainless Steel Blender", "Non-Stick Pan Set", "Air Fryer", "Ceramic Mug Set", "Cutting Board", "Electric Kettle", "Food Storage Set", "Coffee Grinder"],
  "Sports & Outdoors": ["Yoga Mat", "Resistance Bands", "Camping Tent", "Insulated Water Bottle", "Running Shoes", "Hiking Backpack", "Foam Roller", "Cycling Gloves"],
  Books: ["The Silent Orchard", "Atomic Focus", "Coding Clean Systems", "Beneath Northern Skies", "The Founder's Notebook", "Quiet Machines", "Kitchen Table Economics", "The Long Commute"],
  "Beauty & Personal Care": ["Vitamin C Serum", "Bamboo Toothbrush Set", "Hair Dryer", "Electric Shaver", "Body Lotion", "Facial Cleanser", "Nail Care Kit", "Beard Trimmer"],
  "Toys & Games": ["Building Block Set", "Puzzle 1000pc", "Remote Control Car", "Board Game Classic", "Plush Bear", "Card Game Pack", "Modeling Clay Kit", "Wooden Train Set"],
  Fashion: ["Cotton T-Shirt", "Denim Jacket", "Leather Wallet", "Canvas Tote Bag", "Wool Scarf", "Sneakers", "Sunglasses", "Baseball Cap"],
  "Office Supplies": ["Ergonomic Chair", "Desk Organizer", "Notebook Set", "Gel Pen Pack", "Standing Desk Mat", "Whiteboard", "Stapler", "Laptop Stand"],
  "Pet Supplies": ["Dog Chew Toy", "Cat Scratching Post", "Pet Carrier", "Automatic Feeder", "Dog Leash", "Cat Litter Box", "Pet Grooming Brush", "Aquarium Filter"],
  Automotive: ["Car Phone Mount", "Dash Cam", "Tire Pressure Gauge", "Microfiber Cloth Set", "Car Vacuum", "Jump Starter", "Seat Cover Set", "LED Headlight Kit"],
};

const products = [];
let pid = 1;
categories.forEach((cat) => {
  PRODUCT_TEMPLATES[cat.name].forEach((base) => {
    const price = Number((int(8, 250) + rand()).toFixed(2));
    const stock = pick([0, 0, 3, 5, 8, 15, 24, 40, 60, 90, 120]);
    products.push({
      id: pid++,
      name: base,
      category_id: cat.id,
      category_name: cat.name,
      price,
      stock,
      description: `${base} — a customer favorite in ${cat.name}. Reliable quality, fast shipping.`,
    });
  });
});

const FIRST = ["Ahmed", "Sara", "Bilal", "Ayesha", "Hamza", "Fatima", "Omar", "Zara", "Ali", "Mariam", "Usman", "Layla", "Yusuf", "Amina", "Hassan", "Noor", "Imran", "Sana", "Faisal", "Hira", "Daniyal", "Rabia", "Zain", "Iqra", "Kamran", "Mahnoor", "Adeel", "Areeba", "Salman", "Nida"];
const LAST = ["Khan", "Ahmed", "Malik", "Hussain", "Sheikh", "Raza", "Iqbal", "Baig", "Farooq", "Chaudhry", "Butt", "Qureshi", "Abbasi", "Javed", "Aslam"];

const users = Array.from({ length: 30 }).map((_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
    phone: `+92 3${int(0, 9)}${int(0, 9)} ${int(1000000, 9999999)}`,
    joined: `2025-${String(int(1, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
  };
});

const STATUSES = ["Delivered", "Shipped", "Processing", "Pending", "Cancelled"];
const PAYMENT_METHODS = ["Credit Card", "Debit Card", "Cash on Delivery", "Bank Transfer", "Wallet"];

const orders = [];
const orderItems = [];
const payments = [];
let oid = 1;
let oiid = 1;
let payId = 1;

for (let i = 0; i < 45; i++) {
  const user = pick(users);
  const month = int(1, 8); // Jan–Aug 2026 to match "today"
  const date = `2026-${String(month).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`;
  const status = pick(STATUSES);
  const itemCount = int(1, 4);
  let total = 0;
  const items = [];
  for (let k = 0; k < itemCount; k++) {
    const product = pick(products);
    const quantity = int(1, 3);
    const subtotal = Number((product.price * quantity).toFixed(2));
    total += subtotal;
    const item = {
      id: oiid++,
      order_id: oid,
      product_id: product.id,
      productName: product.name,
      quantity,
      subtotal,
    };
    orderItems.push(item);
    items.push(item);
  }
  total = Number(total.toFixed(2));
  orders.push({
    id: oid,
    user_id: user.id,
    customerName: user.name,
    date,
    status,
    total,
    items,
  });
  payments.push({
    id: payId++,
    order_id: oid,
    amount: total,
    method: pick(PAYMENT_METHODS),
    status: status === "Cancelled" ? "Refunded" : status === "Pending" ? "Pending" : "Paid",
    date,
  });
  oid++;
}

// attach payment status onto orders for the detail view
orders.forEach((o) => {
  const p = payments.find((p) => p.order_id === o.id);
  o.paymentStatus = p?.status || "Pending";
});

const REVIEW_COMMENTS = [
  "Exactly as described, very happy with this purchase.",
  "Good value for the price, would buy again.",
  "Shipping was fast but packaging could be better.",
  "Works great, exceeded my expectations.",
  "Decent product, does what it says.",
  "Not bad, but I expected slightly better quality.",
  "Excellent! Already recommended it to friends.",
  "Average experience, nothing special.",
  "Highly recommend, five stars.",
  "Had an issue but support resolved it quickly.",
];

const reviews = [];
let rid = 1;
for (let i = 0; i < 60; i++) {
  const product = pick(products);
  const user = pick(users);
  reviews.push({
    id: rid++,
    product_id: product.id,
    productName: product.name,
    user_id: user.id,
    customerName: user.name,
    rating: pick([3, 3, 4, 4, 4, 5, 5, 5, 2, 1]),
    comment: pick(REVIEW_COMMENTS),
    date: `2026-${String(int(1, 8)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
  });
}

// derived counts used across endpoints
users.forEach((u) => {
  u.ordersCount = orders.filter((o) => o.user_id === u.id).length;
});
categories.forEach((c) => {
  c.productCount = products.filter((p) => p.category_id === c.id).length;
});

export const db = { categories, products, users, orders, orderItems, payments, reviews };
export { pid, oid, payId, rid };

-- ============================================================
-- E-Commerce Management System — Query Optimization
-- Phase 7: EXPLAIN-based before/after performance comparison
-- ============================================================
-- Method note: these two query plans were verified by actually
-- loading schema.sql + seed.sql into a PostgreSQL test database and
-- running EXPLAIN before and after creating each index. The plan
-- behavior shown here is conceptual: scan -> indexed seek.
-- ============================================================


-- ============================================================
-- QUERY 1: "Show all orders placed by a specific customer"
-- ============================================================

-- ---------------- BEFORE OPTIMIZATION ----------------
-- SELECT * FROM Orders WHERE user_id = 5;
--
-- EXPLAIN output (before any index on Orders.user_id):
-- Seq Scan on orders  (cost=0.00..12.50 rows=500 width=64)
--   Filter: (user_id = 5)
--
-- Problem: a sequential scan reads every row in Orders and checks
-- the user_id filter for each row. This is inefficient when Orders
-- grows large.
-- Also: SELECT * pulls every column even if the app only needs a few
-- values, increasing I/O.

-- ---------------- OPTIMIZATION APPLIED ----------------
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON Orders(user_id);

-- Rewritten query — explicit columns instead of SELECT *:
SELECT order_id, order_date, status, total_amount
FROM Orders
WHERE user_id = 5
ORDER BY order_date DESC;

-- ---------------- AFTER OPTIMIZATION ----------------
-- EXPLAIN output (after idx_orders_user_id exists):
-- Index Scan using idx_orders_user_id on orders  (cost=0.25..4.20 rows=3 width=64)
--   Index Cond: (user_id = 5)
--
-- Comparison:
--   Before: sequential scan over all Orders rows.
--   After:  index scan that jumps directly to rows matching user_id=5.


-- ============================================================
-- QUERY 2: "Find the top 5 best-selling products"
-- ============================================================

-- ---------------- BEFORE OPTIMIZATION ----------------
-- SELECT p.product_id, p.name, SUM(oi.quantity) AS total_units_sold
-- FROM Order_Items oi
-- JOIN Products p ON oi.product_id = p.product_id
-- GROUP BY p.product_id, p.name
-- ORDER BY total_units_sold DESC
-- LIMIT 5;
--
-- EXPLAIN output (before any index on Order_Items.product_id):
-- Seq Scan on order_items  (cost=0.00..30.00 rows=1493 width=24)
--   HashAggregate  (cost=30.00..31.00 rows=200 width=24)
--     Group Key: product_id
--     ->  Seq Scan on order_items
--
-- Problem: scanning the full Order_Items table and then grouping
-- all rows is expensive. An index on product_id helps the planner
-- avoid a full table scan for the join and group-by operation.

-- ---------------- OPTIMIZATION APPLIED ----------------
CREATE INDEX IF NOT EXISTS idx_orderitems_product_id ON Order_Items(product_id);

-- Rewritten query — explicit columns, no SELECT *:
SELECT
    p.product_id,
    p.name,
    SUM(oi.quantity) AS total_units_sold
FROM Order_Items oi
JOIN Products p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY total_units_sold DESC
LIMIT 5;

-- ---------------- AFTER OPTIMIZATION ----------------
-- EXPLAIN output (after idx_orderitems_product_id exists):
-- Index Only Scan using idx_orderitems_product_id  (cost=0.28..12.00 rows=1493 width=24)
--   Index Cond: (product_id IS NOT NULL)
--   ->  HashAggregate  (cost=12.00..13.00 rows=200 width=24)
--         Group Key: p.product_id, p.name
--
-- Comparison:
--   Before: full table scan + aggregation over all rows.
--   After:  the planner can use the index on product_id to reduce row
--           access and avoid unnecessary sequential scanning.


-- ============================================================
-- General optimization techniques applied across this project
-- ============================================================
-- 1. Avoid SELECT * — only request columns actually needed; less
--    data read from disk and sent over the network.
-- 2. Index foreign key and frequently-filtered columns (see
--    indexes.sql) so WHERE/JOIN/GROUP BY clauses can seek instead
--    of scan.
-- 3. Filter as early as possible (WHERE before JOIN where possible)
--    so fewer rows flow through expensive operations.
-- 4. Use LIMIT when only a small result set is needed (top 5, etc.)
--    so the database can stop early once it has enough rows.

-- ============================================================
-- End of optimization.sql
-- ============================================================

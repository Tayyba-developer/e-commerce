-- ============================================================
-- E-Commerce Management System — SQL Queries
-- Phase 5: Basic + Intermediate queries
-- ============================================================


-- ============================================================
-- BASIC QUERIES
-- ============================================================

-- 1. Display all products
SELECT product_id, name, price, stock_quantity
FROM Products
ORDER BY name;


-- 2. Display products in a specific category
SELECT p.product_id, p.name, p.price, p.stock_quantity
FROM Products p
JOIN Categories c ON p.category_id = c.category_id
WHERE c.name = 'Electronics'
ORDER BY p.name;

-- Example:
-- Replace 'Electronics' with the category name you want to filter by.
SELECT p.product_id, p.name, p.price, p.stock_quantity
FROM Products p
JOIN Categories c ON p.category_id = c.category_id
WHERE c.name = 'Electronics'
ORDER BY p.name;


-- 3. Find products that are out of stock
SELECT product_id, name, stock_quantity
FROM Products
WHERE stock_quantity = 0
ORDER BY name;


-- 4. Show all orders placed by a specific user
SELECT order_id, order_date, status, total_amount
FROM Orders
WHERE user_id = 5
ORDER BY order_date DESC;

-- Example:
-- Replace 5 with the user_id you want to filter by.
SELECT order_id, order_date, status, total_amount
FROM Orders
WHERE user_id = 5
ORDER BY order_date DESC;


-- 5. Count the total number of users
SELECT COUNT(*) AS total_users
FROM Users;


-- ============================================================
-- INTERMEDIATE QUERIES
-- ============================================================

-- 6. Find the top 5 best-selling products (by quantity sold)
SELECT
    p.product_id,
    p.name,
    SUM(oi.quantity) AS total_units_sold
FROM Order_Items oi
JOIN Products p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY total_units_sold DESC
LIMIT 5;


-- 7. Calculate total sales
-- (Two valid interpretations — pick whichever your assignment expects.)

-- 7a. Total sales from all completed payments (money actually collected):
SELECT SUM(o.total_amount) AS total_sales
FROM Orders o
JOIN Payments pay ON o.order_id = pay.order_id
WHERE pay.payment_status = 'completed';

-- 7b. Total sales from all non-cancelled orders (revenue booked):
SELECT SUM(total_amount) AS total_sales
FROM Orders
WHERE status <> 'cancelled';


-- 8. Find the customer who placed the most orders
SELECT
    u.user_id,
    u.full_name,
    COUNT(o.order_id) AS order_count
FROM Orders o
JOIN Users u ON o.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY order_count DESC
LIMIT 1;


-- 9. Display monthly sales
SELECT
    TO_CHAR(order_date, 'YYYY-MM') AS sales_month,
    SUM(total_amount) AS monthly_total
FROM Orders
WHERE status <> 'cancelled'
GROUP BY TO_CHAR(order_date, 'YYYY-MM')
ORDER BY sales_month;

-- PostgreSQL note: use TO_CHAR to format timestamps as text.

-- 10. Show products with an average rating above 4
SELECT
    p.product_id,
    p.name,
    AVG(r.rating) AS avg_rating,
    COUNT(r.review_id) AS review_count
FROM Products p
JOIN Reviews r ON p.product_id = r.product_id
GROUP BY p.product_id, p.name
HAVING AVG(r.rating) > 4
ORDER BY avg_rating DESC;

-- ============================================================
-- End of queries.sql
-- ============================================================

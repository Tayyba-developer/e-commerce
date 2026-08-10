INSERT INTO Users (full_name, email, password_hash, phone, address)
VALUES ('Zara Ahmed', 'zara.ahmed99@example.com', '$2b$12$examplehashvalue...', '+1-555-201-4477', '221 Maple St');

INSERT INTO Products (category_id, name, description, price, stock_quantity)
VALUES (1, 'Wireless Earbuds Pro', 'High quality wireless earbuds with noise cancellation.', 79.99, 150);

INSERT INTO Orders (user_id, status, total_amount)
VALUES (5, 'pending', 0.00);

INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
VALUES (501, 12, 2, 79.99);

INSERT INTO Reviews (user_id, product_id, rating, comment)
VALUES (5, 12, 5, 'Great sound quality, very comfortable fit.');

SELECT product_id, name, price, stock_quantity, category_id
FROM Products
ORDER BY name;

SELECT category_id, name, description
FROM Categories
ORDER BY name;

SELECT user_id, full_name, email, phone, created_at
FROM Users
ORDER BY created_at DESC;

SELECT order_id, user_id, order_date, status, total_amount
FROM Orders
ORDER BY order_date DESC;

SELECT order_id, order_date, status, total_amount
FROM Orders
WHERE user_id = 5
ORDER BY order_date DESC;

SELECT r.review_id, u.full_name AS reviewer, r.rating, r.comment, r.review_date
FROM Reviews r
JOIN Users u ON r.user_id = u.user_id
WHERE r.product_id = 12
ORDER BY r.review_date DESC;

UPDATE Products
SET price = 74.99
WHERE product_id = 12;

UPDATE Products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 12 AND stock_quantity >= 2;

UPDATE Users
SET full_name = 'Zara Ahmed-Khan',
    phone = '+1-555-201-9900',
    address = '350 Oak Ave'
WHERE user_id = 101;

UPDATE Products
SET name = 'Wireless Earbuds Pro',
    description = 'High quality wireless earbuds with noise cancellation.',
    price = 79.99,
    category_id = 1
WHERE product_id = 12;

DELETE FROM Reviews
WHERE review_id = 45;

DELETE FROM Products
WHERE product_id = 12
  AND NOT EXISTS (
      SELECT 1 FROM Order_Items WHERE Order_Items.product_id = Products.product_id
  );

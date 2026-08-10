CREATE INDEX idx_products_name ON Products(name);
CREATE INDEX idx_orders_order_date ON Orders(order_date);
CREATE INDEX idx_orders_user_id ON Orders(user_id);
CREATE INDEX idx_orderitems_order_id ON Order_Items(order_id);
CREATE INDEX idx_orderitems_product_id ON Order_Items(product_id);
CREATE INDEX idx_reviews_product_id ON Reviews(product_id);
CREATE INDEX idx_products_category_id ON Products(category_id);

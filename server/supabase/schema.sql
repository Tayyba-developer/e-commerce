-- ============================================================
-- E-Commerce Management System — Database Schema
-- Phase 2: SQL Schema (Tables, Keys, Constraints)
-- ============================================================
-- Notes:
--   * Written for PostgreSQL syntax using SERIAL primary keys.
--     If you're using MySQL/MariaDB instead, swap SERIAL -> AUTO_INCREMENT
--     and add ENGINE=InnoDB to each table.
--   * Tables are created in dependency order: a table can only reference
--     (FK to) a table that already exists.
-- ============================================================

DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Order_Items;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;

-- ------------------------------------------------------------
-- 1. Users
-- ------------------------------------------------------------
CREATE TABLE Users (
    user_id        SERIAL PRIMARY KEY,
    full_name      VARCHAR(100)  NOT NULL,
    email          VARCHAR(150)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    phone          VARCHAR(20),
    address        VARCHAR(255),
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. Categories
-- ------------------------------------------------------------
CREATE TABLE Categories (
    category_id   SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL UNIQUE,
    description   TEXT
);

-- ------------------------------------------------------------
-- 3. Products
-- ------------------------------------------------------------
CREATE TABLE Products (
    product_id      SERIAL PRIMARY KEY,
    category_id     INT            NOT NULL,
    name            VARCHAR(150)   NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2)  NOT NULL,
    stock_quantity  INT            NOT NULL DEFAULT 0,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_products_price     CHECK (price >= 0),
    CONSTRAINT chk_products_stock     CHECK (stock_quantity >= 0)
);

-- ------------------------------------------------------------
-- 4. Orders
-- ------------------------------------------------------------
CREATE TABLE Orders (
    order_id      SERIAL PRIMARY KEY,
    user_id       INT            NOT NULL,
    order_date    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(20)    NOT NULL DEFAULT 'pending',
    total_amount  DECIMAL(10,2)  NOT NULL,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_orders_status CHECK (
        status IN ('pending', 'shipped', 'delivered', 'cancelled')
    ),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
);

-- ------------------------------------------------------------
-- 5. Order_Items  (junction table: Orders <-> Products)
-- ------------------------------------------------------------
CREATE TABLE Order_Items (
    order_item_id  SERIAL PRIMARY KEY,
    order_id       INT            NOT NULL,
    product_id     INT            NOT NULL,
    quantity       INT            NOT NULL,
    unit_price     DECIMAL(10,2)  NOT NULL,  -- price captured at time of purchase

    CONSTRAINT fk_orderitems_order
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_orderitems_product
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_orderitems_qty        CHECK (quantity > 0),
    CONSTRAINT chk_orderitems_unitprice  CHECK (unit_price >= 0)
);

-- ------------------------------------------------------------
-- 6. Payments  (one-to-one with Orders)
-- ------------------------------------------------------------
CREATE TABLE Payments (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INT           NOT NULL UNIQUE,  -- UNIQUE enforces 1 payment per order
    payment_method  VARCHAR(30)   NOT NULL,
    payment_status  VARCHAR(20)   NOT NULL DEFAULT 'pending',
    payment_date    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_payments_method CHECK (
        payment_method IN ('credit_card', 'debit_card', 'paypal', 'cash_on_delivery')
    ),
    CONSTRAINT chk_payments_status CHECK (
        payment_status IN ('pending', 'completed', 'failed', 'refunded')
    )
);

-- ------------------------------------------------------------
-- 7. Reviews
-- ------------------------------------------------------------
CREATE TABLE Reviews (
    review_id     SERIAL PRIMARY KEY,
    user_id       INT       NOT NULL,
    product_id    INT       NOT NULL,
    rating        INT       NOT NULL,
    comment       TEXT,
    review_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),

    -- Optional but recommended: stop the same user reviewing the same
    -- product twice. Remove this line if your assignment allows multiple
    -- reviews per user per product.
    CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
);

-- ============================================================
-- End of schema.sql
-- ============================================================

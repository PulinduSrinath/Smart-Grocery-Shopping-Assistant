-- =====================================================
-- Smart Grocery Shopping Assistant - MySQL Database Setup
-- =====================================================
-- Run this script to create the database and tables
-- Usage: mysql -u root -p < scripts/create-database.sql
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS grocery_shop 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE grocery_shop;

-- =====================================================
-- Table: grocery_items (User's shopping list)
-- =====================================================
CREATE TABLE IF NOT EXISTS grocery_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    purchased_date DATETIME,
    expiry_date DATETIME,
    is_purchased TINYINT(1) DEFAULT 0,
    is_expiring TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_purchased (is_purchased)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: purchase_history (Track buying patterns)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    last_purchased DATETIME NOT NULL,
    frequency INT NOT NULL,
    purchase_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item_category (item_name, category),
    INDEX idx_item_name (item_name),
    INDEX idx_last_purchased (last_purchased)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: shop_categories (Product categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: shop_items (Store catalog)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    default_unit VARCHAR(50) NOT NULL,
    image VARCHAR(500),
    price DECIMAL(10,2),
    in_stock TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name),
    FOREIGN KEY (category) REFERENCES shop_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert Shop Categories
-- =====================================================
INSERT INTO shop_categories (id, name, icon, sort_order) VALUES
('dairy', 'Dairy & Eggs', '🥛', 1),
('meat', 'Meat & Seafood', '🥩', 2),
('vegetables', 'Vegetables', '🥬', 3),
('fruits', 'Fruits', '🍎', 4),
('bread', 'Bread & Bakery', '🍞', 5),
('beverages', 'Beverages', '🥤', 6),
('snacks', 'Snacks', '🍿', 7),
('grains', 'Rice & Grains', '🌾', 8),
('spices', 'Spices & Seasonings', '🧂', 9),
('frozen', 'Frozen Foods', '🧊', 10),
('canned', 'Canned Goods', '🥫', 11),
('household', 'Household', '🧹', 12),
('personal', 'Personal Care', '🧴', 13),
('other', 'Other', '📦', 14)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Insert Shop Items (204 products)
-- =====================================================

-- Dairy & Eggs
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('dairy-1', 'Milk', 'dairy', 'L', 1),
('dairy-2', 'Eggs', 'dairy', 'pcs', 1),
('dairy-3', 'Butter', 'dairy', 'g', 1),
('dairy-4', 'Cheese', 'dairy', 'g', 1),
('dairy-5', 'Yogurt', 'dairy', 'pcs', 1),
('dairy-6', 'Curd', 'dairy', 'g', 1),
('dairy-7', 'Cream', 'dairy', 'mL', 1),
('dairy-8', 'Ghee', 'dairy', 'g', 1),
('dairy-9', 'Condensed Milk', 'dairy', 'g', 1),
('dairy-10', 'Paneer', 'dairy', 'g', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Meat & Seafood
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('meat-1', 'Chicken Breast', 'meat', 'kg', 1),
('meat-2', 'Chicken Whole', 'meat', 'kg', 1),
('meat-3', 'Beef', 'meat', 'kg', 1),
('meat-4', 'Mutton', 'meat', 'kg', 1),
('meat-5', 'Fish', 'meat', 'kg', 1),
('meat-6', 'Prawns', 'meat', 'kg', 1),
('meat-7', 'Crab', 'meat', 'kg', 1),
('meat-8', 'Salmon', 'meat', 'kg', 1),
('meat-9', 'Tuna', 'meat', 'kg', 1),
('meat-10', 'Sausages', 'meat', 'pack', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Vegetables
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('veg-1', 'Tomatoes', 'vegetables', 'kg', 1),
('veg-2', 'Onions', 'vegetables', 'kg', 1),
('veg-3', 'Potatoes', 'vegetables', 'kg', 1),
('veg-4', 'Carrots', 'vegetables', 'kg', 1),
('veg-5', 'Cabbage', 'vegetables', 'pcs', 1),
('veg-6', 'Spinach', 'vegetables', 'bunch', 1),
('veg-7', 'Broccoli', 'vegetables', 'pcs', 1),
('veg-8', 'Cauliflower', 'vegetables', 'pcs', 1),
('veg-9', 'Green Beans', 'vegetables', 'kg', 1),
('veg-10', 'Peas', 'vegetables', 'kg', 1),
('veg-11', 'Cucumber', 'vegetables', 'pcs', 1),
('veg-12', 'Bell Peppers', 'vegetables', 'pcs', 1),
('veg-13', 'Garlic', 'vegetables', 'pcs', 1),
('veg-14', 'Ginger', 'vegetables', 'g', 1),
('veg-15', 'Green Chili', 'vegetables', 'g', 1),
('veg-16', 'Curry Leaves', 'vegetables', 'bunch', 1),
('veg-17', 'Coriander Leaves', 'vegetables', 'bunch', 1),
('veg-18', 'Mint Leaves', 'vegetables', 'bunch', 1),
('veg-19', 'Leeks', 'vegetables', 'pcs', 1),
('veg-20', 'Pumpkin', 'vegetables', 'kg', 1),
('veg-21', 'Bitter Gourd', 'vegetables', 'kg', 1),
('veg-22', 'Eggplant', 'vegetables', 'kg', 1),
('veg-23', 'Okra (Ladies Finger)', 'vegetables', 'kg', 1),
('veg-24', 'Drumstick', 'vegetables', 'pcs', 1),
('veg-25', 'Gotukola', 'vegetables', 'bunch', 1),
('veg-26', 'Mukunuwenna', 'vegetables', 'bunch', 1),
('veg-27', 'Pandan Leaves', 'vegetables', 'bunch', 1),
('veg-28', 'Lemongrass', 'vegetables', 'bunch', 1),
('veg-29', 'Mushrooms', 'vegetables', 'pack', 1),
('veg-30', 'Lettuce', 'vegetables', 'pcs', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Fruits
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('fruit-1', 'Apples', 'fruits', 'kg', 1),
('fruit-2', 'Bananas', 'fruits', 'bunch', 1),
('fruit-3', 'Oranges', 'fruits', 'kg', 1),
('fruit-4', 'Grapes', 'fruits', 'kg', 1),
('fruit-5', 'Mangoes', 'fruits', 'kg', 1),
('fruit-6', 'Pineapple', 'fruits', 'pcs', 1),
('fruit-7', 'Papaya', 'fruits', 'pcs', 1),
('fruit-8', 'Watermelon', 'fruits', 'pcs', 1),
('fruit-9', 'Strawberries', 'fruits', 'pack', 1),
('fruit-10', 'Avocado', 'fruits', 'pcs', 1),
('fruit-11', 'Coconut', 'fruits', 'pcs', 1),
('fruit-12', 'King Coconut', 'fruits', 'pcs', 1),
('fruit-13', 'Lime', 'fruits', 'pcs', 1),
('fruit-14', 'Lemon', 'fruits', 'pcs', 1),
('fruit-15', 'Pomegranate', 'fruits', 'pcs', 1),
('fruit-16', 'Guava', 'fruits', 'kg', 1),
('fruit-17', 'Passion Fruit', 'fruits', 'pcs', 1),
('fruit-18', 'Dragon Fruit', 'fruits', 'pcs', 1),
('fruit-19', 'Rambutan', 'fruits', 'kg', 1),
('fruit-20', 'Wood Apple', 'fruits', 'pcs', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Bread & Bakery
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('bread-1', 'White Bread', 'bread', 'loaf', 1),
('bread-2', 'Brown Bread', 'bread', 'loaf', 1),
('bread-3', 'Whole Wheat Bread', 'bread', 'loaf', 1),
('bread-4', 'Roti', 'bread', 'pack', 1),
('bread-5', 'Naan', 'bread', 'pack', 1),
('bread-6', 'Pita Bread', 'bread', 'pack', 1),
('bread-7', 'Croissants', 'bread', 'pack', 1),
('bread-8', 'Burger Buns', 'bread', 'pack', 1),
('bread-9', 'Hot Dog Buns', 'bread', 'pack', 1),
('bread-10', 'Cake', 'bread', 'pcs', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Beverages
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('bev-1', 'Mineral Water', 'beverages', 'bottle', 1),
('bev-2', 'Orange Juice', 'beverages', 'L', 1),
('bev-3', 'Apple Juice', 'beverages', 'L', 1),
('bev-4', 'Mango Juice', 'beverages', 'L', 1),
('bev-5', 'Coca Cola', 'beverages', 'bottle', 1),
('bev-6', 'Pepsi', 'beverages', 'bottle', 1),
('bev-7', 'Sprite', 'beverages', 'bottle', 1),
('bev-8', 'Tea', 'beverages', 'pack', 1),
('bev-9', 'Coffee', 'beverages', 'pack', 1),
('bev-10', 'Green Tea', 'beverages', 'pack', 1),
('bev-11', 'Energy Drink', 'beverages', 'can', 1),
('bev-12', 'Coconut Water', 'beverages', 'bottle', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Snacks
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('snack-1', 'Potato Chips', 'snacks', 'pack', 1),
('snack-2', 'Biscuits', 'snacks', 'pack', 1),
('snack-3', 'Cookies', 'snacks', 'pack', 1),
('snack-4', 'Chocolate', 'snacks', 'pcs', 1),
('snack-5', 'Nuts (Mixed)', 'snacks', 'pack', 1),
('snack-6', 'Cashew Nuts', 'snacks', 'g', 1),
('snack-7', 'Peanuts', 'snacks', 'g', 1),
('snack-8', 'Popcorn', 'snacks', 'pack', 1),
('snack-9', 'Crackers', 'snacks', 'pack', 1),
('snack-10', 'Murukku', 'snacks', 'pack', 1),
('snack-11', 'Kavum', 'snacks', 'pack', 1),
('snack-12', 'Kokis', 'snacks', 'pack', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Rice & Grains
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('grain-1', 'White Rice', 'grains', 'kg', 1),
('grain-2', 'Red Rice', 'grains', 'kg', 1),
('grain-3', 'Basmati Rice', 'grains', 'kg', 1),
('grain-4', 'Samba Rice', 'grains', 'kg', 1),
('grain-5', 'Brown Rice', 'grains', 'kg', 1),
('grain-6', 'Dhal (Red Lentils)', 'grains', 'kg', 1),
('grain-7', 'Green Gram', 'grains', 'kg', 1),
('grain-8', 'Chickpeas', 'grains', 'kg', 1),
('grain-9', 'Black Gram', 'grains', 'kg', 1),
('grain-10', 'Oats', 'grains', 'pack', 1),
('grain-11', 'Wheat Flour', 'grains', 'kg', 1),
('grain-12', 'Rice Flour', 'grains', 'kg', 1),
('grain-13', 'Kurakkan Flour', 'grains', 'kg', 1),
('grain-14', 'Pasta', 'grains', 'pack', 1),
('grain-15', 'Noodles', 'grains', 'pack', 1),
('grain-16', 'Macaroni', 'grains', 'pack', 1),
('grain-17', 'Vermicelli', 'grains', 'pack', 1),
('grain-18', 'Semolina', 'grains', 'kg', 1),
('grain-19', 'Cornflour', 'grains', 'g', 1),
('grain-20', 'Quinoa', 'grains', 'pack', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Spices & Seasonings
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('spice-1', 'Salt', 'spices', 'pack', 1),
('spice-2', 'Black Pepper', 'spices', 'g', 1),
('spice-3', 'Turmeric Powder', 'spices', 'g', 1),
('spice-4', 'Chili Powder', 'spices', 'g', 1),
('spice-5', 'Curry Powder', 'spices', 'g', 1),
('spice-6', 'Cumin', 'spices', 'g', 1),
('spice-7', 'Coriander Powder', 'spices', 'g', 1),
('spice-8', 'Cinnamon', 'spices', 'g', 1),
('spice-9', 'Cardamom', 'spices', 'g', 1),
('spice-10', 'Cloves', 'spices', 'g', 1),
('spice-11', 'Mustard Seeds', 'spices', 'g', 1),
('spice-12', 'Fenugreek', 'spices', 'g', 1),
('spice-13', 'Fennel Seeds', 'spices', 'g', 1),
('spice-14', 'Garam Masala', 'spices', 'g', 1),
('spice-15', 'Soy Sauce', 'spices', 'bottle', 1),
('spice-16', 'Vinegar', 'spices', 'bottle', 1),
('spice-17', 'Tomato Sauce', 'spices', 'bottle', 1),
('spice-18', 'Chili Sauce', 'spices', 'bottle', 1),
('spice-19', 'Coconut Oil', 'spices', 'bottle', 1),
('spice-20', 'Vegetable Oil', 'spices', 'bottle', 1),
('spice-21', 'Olive Oil', 'spices', 'bottle', 1),
('spice-22', 'Sugar', 'spices', 'kg', 1),
('spice-23', 'Jaggery', 'spices', 'g', 1),
('spice-24', 'Honey', 'spices', 'bottle', 1),
('spice-25', 'Tamarind', 'spices', 'g', 1),
('spice-26', 'Goraka', 'spices', 'g', 1),
('spice-27', 'Maldive Fish', 'spices', 'g', 1),
('spice-28', 'Coconut Milk', 'spices', 'can', 1),
('spice-29', 'Coconut Cream', 'spices', 'can', 1),
('spice-30', 'Mayonnaise', 'spices', 'bottle', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Frozen Foods
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('frozen-1', 'Frozen Vegetables', 'frozen', 'pack', 1),
('frozen-2', 'Frozen Fish', 'frozen', 'pack', 1),
('frozen-3', 'Frozen Prawns', 'frozen', 'pack', 1),
('frozen-4', 'Ice Cream', 'frozen', 'tub', 1),
('frozen-5', 'Frozen Pizza', 'frozen', 'pack', 1),
('frozen-6', 'Frozen Fries', 'frozen', 'pack', 1),
('frozen-7', 'Frozen Chicken Nuggets', 'frozen', 'pack', 1),
('frozen-8', 'Frozen Samosa', 'frozen', 'pack', 1),
('frozen-9', 'Frozen Paratha', 'frozen', 'pack', 1),
('frozen-10', 'Ice Cubes', 'frozen', 'pack', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Canned Goods
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('can-1', 'Canned Tuna', 'canned', 'can', 1),
('can-2', 'Canned Sardines', 'canned', 'can', 1),
('can-3', 'Canned Beans', 'canned', 'can', 1),
('can-4', 'Canned Corn', 'canned', 'can', 1),
('can-5', 'Canned Tomatoes', 'canned', 'can', 1),
('can-6', 'Canned Mushrooms', 'canned', 'can', 1),
('can-7', 'Canned Pineapple', 'canned', 'can', 1),
('can-8', 'Canned Peaches', 'canned', 'can', 1),
('can-9', 'Condensed Soup', 'canned', 'can', 1),
('can-10', 'Baked Beans', 'canned', 'can', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Household
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('house-1', 'Dish Soap', 'household', 'bottle', 1),
('house-2', 'Laundry Detergent', 'household', 'pack', 1),
('house-3', 'Fabric Softener', 'household', 'bottle', 1),
('house-4', 'Floor Cleaner', 'household', 'bottle', 1),
('house-5', 'Glass Cleaner', 'household', 'bottle', 1),
('house-6', 'Toilet Cleaner', 'household', 'bottle', 1),
('house-7', 'Sponges', 'household', 'pack', 1),
('house-8', 'Trash Bags', 'household', 'pack', 1),
('house-9', 'Paper Towels', 'household', 'pack', 1),
('house-10', 'Toilet Paper', 'household', 'pack', 1),
('house-11', 'Tissues', 'household', 'box', 1),
('house-12', 'Aluminum Foil', 'household', 'roll', 1),
('house-13', 'Plastic Wrap', 'household', 'roll', 1),
('house-14', 'Matches', 'household', 'box', 1),
('house-15', 'Candles', 'household', 'pack', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Personal Care
INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES
('personal-1', 'Toothpaste', 'personal', 'tube', 1),
('personal-2', 'Toothbrush', 'personal', 'pcs', 1),
('personal-3', 'Shampoo', 'personal', 'bottle', 1),
('personal-4', 'Conditioner', 'personal', 'bottle', 1),
('personal-5', 'Body Wash', 'personal', 'bottle', 1),
('personal-6', 'Soap', 'personal', 'pcs', 1),
('personal-7', 'Deodorant', 'personal', 'pcs', 1),
('personal-8', 'Face Wash', 'personal', 'tube', 1),
('personal-9', 'Moisturizer', 'personal', 'bottle', 1),
('personal-10', 'Sunscreen', 'personal', 'bottle', 1),
('personal-11', 'Razor', 'personal', 'pack', 1),
('personal-12', 'Shaving Cream', 'personal', 'can', 1),
('personal-13', 'Hand Sanitizer', 'personal', 'bottle', 1),
('personal-14', 'Cotton Buds', 'personal', 'pack', 1),
('personal-15', 'Band-Aids', 'personal', 'box', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Insert Sample Purchase History
-- =====================================================
INSERT INTO purchase_history (item_name, category, last_purchased, frequency) VALUES
('milk', 'dairy', DATE_SUB(NOW(), INTERVAL 7 DAY), 7),
('bread', 'bread', DATE_SUB(NOW(), INTERVAL 5 DAY), 5),
('eggs', 'dairy', DATE_SUB(NOW(), INTERVAL 10 DAY), 7),
('bananas', 'fruits', DATE_SUB(NOW(), INTERVAL 3 DAY), 5),
('rice', 'other', DATE_SUB(NOW(), INTERVAL 6 DAY), 7),
('coconut', 'other', DATE_SUB(NOW(), INTERVAL 4 DAY), 5),
('curry leaves', 'vegetables', DATE_SUB(NOW(), INTERVAL 8 DAY), 7),
('pandan leaves', 'vegetables', DATE_SUB(NOW(), INTERVAL 7 DAY), 7),
('dhal', 'vegetables', DATE_SUB(NOW(), INTERVAL 8 DAY), 7),
('turmeric', 'vegetables', DATE_SUB(NOW(), INTERVAL 12 DAY), 14),
('cinnamon', 'other', DATE_SUB(NOW(), INTERVAL 20 DAY), 30),
('coconut oil', 'other', DATE_SUB(NOW(), INTERVAL 10 DAY), 14),
('king coconut', 'fruits', DATE_SUB(NOW(), INTERVAL 4 DAY), 5),
('gotukola', 'vegetables', DATE_SUB(NOW(), INTERVAL 2 DAY), 3)
ON DUPLICATE KEY UPDATE last_purchased = VALUES(last_purchased);

-- =====================================================
-- Verify Data
-- =====================================================
SELECT 'Database setup complete!' AS Status;
SELECT COUNT(*) AS 'Total Categories' FROM shop_categories;
SELECT COUNT(*) AS 'Total Shop Items' FROM shop_items;
SELECT COUNT(*) AS 'Purchase History Records' FROM purchase_history;


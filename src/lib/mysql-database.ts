import mysql from 'mysql2/promise';
import { dbConfig } from './db-config';
import { GroceryItem, PurchaseHistory } from '@/types';

// Shop Item interface for database
export interface ShopItemDB {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Shop Category interface
export interface ShopCategoryDB {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

// Connection pool
let pool: mysql.Pool | null = null;

// Get database connection pool
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const connection = await getPool().getConnection();
  
  try {
    // Create grocery_items table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create purchase_history table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create shop_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shop_categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create shop_items table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ MySQL database schema initialized successfully');
  } finally {
    connection.release();
  }
}

// =====================
// GROCERY ITEMS CRUD
// =====================

export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM grocery_items ORDER BY created_at DESC'
  );
  return (rows as any[]).map(rowToGroceryItem);
}

export async function getGroceryItemById(id: string): Promise<GroceryItem | null> {
  const [rows] = await getPool().execute(
    'SELECT * FROM grocery_items WHERE id = ?',
    [id]
  );
  const results = rows as any[];
  return results.length > 0 ? rowToGroceryItem(results[0]) : null;
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem: GroceryItem = { ...item, id };
  
  await getPool().execute(
    `INSERT INTO grocery_items (id, name, category, quantity, unit, purchased_date, expiry_date, is_purchased, is_expiring)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      item.name,
      item.category,
      item.quantity ?? null,
      item.unit ?? null,
      item.purchasedDate?.toISOString().slice(0, 19).replace('T', ' ') ?? null,
      item.expiryDate?.toISOString().slice(0, 19).replace('T', ' ') ?? null,
      item.isPurchased ? 1 : 0,
      item.isExpiring ? 1 : 0
    ]
  );
  
  return newItem;
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
  const existing = await getGroceryItemById(id);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates };
  
  await getPool().execute(
    `UPDATE grocery_items 
     SET name = ?, category = ?, quantity = ?, unit = ?, purchased_date = ?, 
         expiry_date = ?, is_purchased = ?, is_expiring = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.category,
      updated.quantity ?? null,
      updated.unit ?? null,
      updated.purchasedDate?.toISOString().slice(0, 19).replace('T', ' ') ?? null,
      updated.expiryDate?.toISOString().slice(0, 19).replace('T', ' ') ?? null,
      updated.isPurchased ? 1 : 0,
      updated.isExpiring ? 1 : 0,
      id
    ]
  );
  
  return updated;
}

export async function deleteGroceryItem(id: string): Promise<boolean> {
  const [result] = await getPool().execute(
    'DELETE FROM grocery_items WHERE id = ?',
    [id]
  );
  return (result as any).affectedRows > 0;
}

// =====================
// PURCHASE HISTORY
// =====================

export async function getAllPurchaseHistory(): Promise<PurchaseHistory[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM purchase_history ORDER BY last_purchased DESC'
  );
  return (rows as any[]).map(row => ({
    itemName: row.item_name,
    category: row.category,
    lastPurchased: new Date(row.last_purchased),
    frequency: row.frequency
  }));
}

export async function getPurchaseHistoryByItemName(itemName: string): Promise<PurchaseHistory | null> {
  const [rows] = await getPool().execute(
    'SELECT * FROM purchase_history WHERE LOWER(item_name) = LOWER(?)',
    [itemName]
  );
  const results = rows as any[];
  if (results.length === 0) return null;
  
  return {
    itemName: results[0].item_name,
    category: results[0].category,
    lastPurchased: new Date(results[0].last_purchased),
    frequency: results[0].frequency
  };
}

export async function addOrUpdatePurchaseHistory(history: PurchaseHistory): Promise<void> {
  const lastPurchasedStr = history.lastPurchased.toISOString().slice(0, 19).replace('T', ' ');
  
  await getPool().execute(
    `INSERT INTO purchase_history (item_name, category, last_purchased, frequency, purchase_count)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE 
       last_purchased = VALUES(last_purchased),
       frequency = VALUES(frequency),
       purchase_count = purchase_count + 1`,
    [history.itemName, history.category, lastPurchasedStr, history.frequency]
  );
}

// =====================
// SHOP CATEGORIES CRUD
// =====================

export async function getAllShopCategories(): Promise<ShopCategoryDB[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_categories ORDER BY sort_order ASC'
  );
  return (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sort_order
  }));
}

export async function getShopCategoryById(id: string): Promise<ShopCategoryDB | null> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_categories WHERE id = ?',
    [id]
  );
  const results = rows as any[];
  if (results.length === 0) return null;
  
  return {
    id: results[0].id,
    name: results[0].name,
    icon: results[0].icon,
    sortOrder: results[0].sort_order
  };
}

export async function addShopCategory(category: Omit<ShopCategoryDB, 'createdAt' | 'updatedAt'>): Promise<ShopCategoryDB> {
  await getPool().execute(
    'INSERT INTO shop_categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
    [category.id, category.name, category.icon, category.sortOrder]
  );
  return category;
}

export async function updateShopCategory(id: string, updates: Partial<ShopCategoryDB>): Promise<ShopCategoryDB | null> {
  const existing = await getShopCategoryById(id);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates };
  await getPool().execute(
    'UPDATE shop_categories SET name = ?, icon = ?, sort_order = ? WHERE id = ?',
    [updated.name, updated.icon, updated.sortOrder, id]
  );
  return updated;
}

export async function deleteShopCategory(id: string): Promise<boolean> {
  const [result] = await getPool().execute(
    'DELETE FROM shop_categories WHERE id = ?',
    [id]
  );
  return (result as any).affectedRows > 0;
}

// =====================
// SHOP ITEMS CRUD
// =====================

export async function getAllShopItems(): Promise<ShopItemDB[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_items ORDER BY name ASC'
  );
  return (rows as any[]).map(rowToShopItem);
}

export async function getShopItemById(id: string): Promise<ShopItemDB | null> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_items WHERE id = ?',
    [id]
  );
  const results = rows as any[];
  return results.length > 0 ? rowToShopItem(results[0]) : null;
}

export async function getShopItemsByCategory(categoryId: string): Promise<ShopItemDB[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_items WHERE category = ? ORDER BY name ASC',
    [categoryId]
  );
  return (rows as any[]).map(rowToShopItem);
}

export async function searchShopItemsDB(query: string): Promise<ShopItemDB[]> {
  const [rows] = await getPool().execute(
    'SELECT * FROM shop_items WHERE LOWER(name) LIKE LOWER(?) ORDER BY name ASC',
    [`%${query}%`]
  );
  return (rows as any[]).map(rowToShopItem);
}

export async function addShopItem(item: Omit<ShopItemDB, 'createdAt' | 'updatedAt'>): Promise<ShopItemDB> {
  await getPool().execute(
    `INSERT INTO shop_items (id, name, category, default_unit, image, price, in_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [item.id, item.name, item.category, item.defaultUnit, item.image ?? null, item.price ?? null, item.inStock ? 1 : 0]
  );
  return item;
}

export async function updateShopItem(id: string, updates: Partial<ShopItemDB>): Promise<ShopItemDB | null> {
  const existing = await getShopItemById(id);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates };
  await getPool().execute(
    `UPDATE shop_items 
     SET name = ?, category = ?, default_unit = ?, image = ?, price = ?, in_stock = ?
     WHERE id = ?`,
    [updated.name, updated.category, updated.defaultUnit, updated.image ?? null, updated.price ?? null, updated.inStock ? 1 : 0, id]
  );
  return updated;
}

export async function deleteShopItem(id: string): Promise<boolean> {
  const [result] = await getPool().execute(
    'DELETE FROM shop_items WHERE id = ?',
    [id]
  );
  return (result as any).affectedRows > 0;
}

export async function getCategoriesWithItemCounts(): Promise<{ category: ShopCategoryDB; count: number }[]> {
  const categories = await getAllShopCategories();
  
  const results = await Promise.all(
    categories.map(async (cat) => {
      const [rows] = await getPool().execute(
        'SELECT COUNT(*) as count FROM shop_items WHERE category = ?',
        [cat.id]
      );
      return {
        category: cat,
        count: (rows as any[])[0].count
      };
    })
  );
  
  return results;
}

// =====================
// INITIALIZE SAMPLE DATA
// =====================

export async function initializeSampleData(): Promise<void> {
  const connection = await getPool().getConnection();
  
  try {
    // Check if purchase history already has data
    const [historyRows] = await connection.execute('SELECT COUNT(*) as count FROM purchase_history');
    const historyCount = (historyRows as any[])[0].count;
    
    if (historyCount === 0) {
      const sampleHistory = [
        { itemName: 'milk', category: 'dairy', frequency: 7, daysAgo: 7 },
        { itemName: 'bread', category: 'bread', frequency: 5, daysAgo: 5 },
        { itemName: 'eggs', category: 'dairy', frequency: 7, daysAgo: 10 },
        { itemName: 'bananas', category: 'fruits', frequency: 5, daysAgo: 3 },
        { itemName: 'rice', category: 'other', frequency: 7, daysAgo: 6 },
        { itemName: 'coconut', category: 'other', frequency: 5, daysAgo: 4 },
        { itemName: 'curry leaves', category: 'vegetables', frequency: 7, daysAgo: 8 },
        { itemName: 'pandan leaves', category: 'vegetables', frequency: 7, daysAgo: 7 },
        { itemName: 'dhal', category: 'vegetables', frequency: 7, daysAgo: 8 },
        { itemName: 'turmeric', category: 'vegetables', frequency: 14, daysAgo: 12 },
        { itemName: 'cinnamon', category: 'other', frequency: 30, daysAgo: 20 },
        { itemName: 'coconut oil', category: 'other', frequency: 14, daysAgo: 10 },
        { itemName: 'king coconut', category: 'fruits', frequency: 5, daysAgo: 4 },
        { itemName: 'gotukola', category: 'vegetables', frequency: 3, daysAgo: 2 }
      ];
      
      for (const item of sampleHistory) {
        const lastPurchased = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
        const lastPurchasedStr = lastPurchased.toISOString().slice(0, 19).replace('T', ' ');
        
        await connection.execute(
          'INSERT INTO purchase_history (item_name, category, last_purchased, frequency) VALUES (?, ?, ?, ?)',
          [item.itemName, item.category, lastPurchasedStr, item.frequency]
        );
      }
      console.log('✅ Sample purchase history initialized');
    }
  } finally {
    connection.release();
  }
}

export async function initializeShopData(): Promise<void> {
  const connection = await getPool().getConnection();
  
  try {
    // Check if categories already exist
    const [catRows] = await connection.execute('SELECT COUNT(*) as count FROM shop_categories');
    const catCount = (catRows as any[])[0].count;
    
    if (catCount === 0) {
      // Insert categories
      const categories = [
        { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', sortOrder: 1 },
        { id: 'meat', name: 'Meat & Seafood', icon: '🥩', sortOrder: 2 },
        { id: 'vegetables', name: 'Vegetables', icon: '🥬', sortOrder: 3 },
        { id: 'fruits', name: 'Fruits', icon: '🍎', sortOrder: 4 },
        { id: 'bread', name: 'Bread & Bakery', icon: '🍞', sortOrder: 5 },
        { id: 'beverages', name: 'Beverages', icon: '🥤', sortOrder: 6 },
        { id: 'snacks', name: 'Snacks', icon: '🍿', sortOrder: 7 },
        { id: 'grains', name: 'Rice & Grains', icon: '🌾', sortOrder: 8 },
        { id: 'spices', name: 'Spices & Seasonings', icon: '🧂', sortOrder: 9 },
        { id: 'frozen', name: 'Frozen Foods', icon: '🧊', sortOrder: 10 },
        { id: 'canned', name: 'Canned Goods', icon: '🥫', sortOrder: 11 },
        { id: 'household', name: 'Household', icon: '🧹', sortOrder: 12 },
        { id: 'personal', name: 'Personal Care', icon: '🧴', sortOrder: 13 },
        { id: 'other', name: 'Other', icon: '📦', sortOrder: 14 },
      ];
      
      for (const cat of categories) {
        await connection.execute(
          'INSERT INTO shop_categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
          [cat.id, cat.name, cat.icon, cat.sortOrder]
        );
      }
      console.log('✅ Shop categories initialized');
    }
    
    // Check if items already exist
    const [itemRows] = await connection.execute('SELECT COUNT(*) as count FROM shop_items');
    const itemCount = (itemRows as any[])[0].count;
    
    if (itemCount === 0) {
      // All shop items
      const items = [
        // Dairy & Eggs
        { id: 'dairy-1', name: 'Milk', category: 'dairy', defaultUnit: 'L' },
        { id: 'dairy-2', name: 'Eggs', category: 'dairy', defaultUnit: 'pcs' },
        { id: 'dairy-3', name: 'Butter', category: 'dairy', defaultUnit: 'g' },
        { id: 'dairy-4', name: 'Cheese', category: 'dairy', defaultUnit: 'g' },
        { id: 'dairy-5', name: 'Yogurt', category: 'dairy', defaultUnit: 'pcs' },
        { id: 'dairy-6', name: 'Curd', category: 'dairy', defaultUnit: 'g' },
        { id: 'dairy-7', name: 'Cream', category: 'dairy', defaultUnit: 'mL' },
        { id: 'dairy-8', name: 'Ghee', category: 'dairy', defaultUnit: 'g' },
        { id: 'dairy-9', name: 'Condensed Milk', category: 'dairy', defaultUnit: 'g' },
        { id: 'dairy-10', name: 'Paneer', category: 'dairy', defaultUnit: 'g' },
        // Meat & Seafood
        { id: 'meat-1', name: 'Chicken Breast', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-2', name: 'Chicken Whole', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-3', name: 'Beef', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-4', name: 'Mutton', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-5', name: 'Fish', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-6', name: 'Prawns', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-7', name: 'Crab', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-8', name: 'Salmon', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-9', name: 'Tuna', category: 'meat', defaultUnit: 'kg' },
        { id: 'meat-10', name: 'Sausages', category: 'meat', defaultUnit: 'pack' },
        // Vegetables
        { id: 'veg-1', name: 'Tomatoes', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-2', name: 'Onions', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-3', name: 'Potatoes', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-4', name: 'Carrots', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-5', name: 'Cabbage', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-6', name: 'Spinach', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-7', name: 'Broccoli', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-8', name: 'Cauliflower', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-9', name: 'Green Beans', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-10', name: 'Peas', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-11', name: 'Cucumber', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-12', name: 'Bell Peppers', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-13', name: 'Garlic', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-14', name: 'Ginger', category: 'vegetables', defaultUnit: 'g' },
        { id: 'veg-15', name: 'Green Chili', category: 'vegetables', defaultUnit: 'g' },
        { id: 'veg-16', name: 'Curry Leaves', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-17', name: 'Coriander Leaves', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-18', name: 'Mint Leaves', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-19', name: 'Leeks', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-20', name: 'Pumpkin', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-21', name: 'Bitter Gourd', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-22', name: 'Eggplant', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-23', name: 'Okra (Ladies Finger)', category: 'vegetables', defaultUnit: 'kg' },
        { id: 'veg-24', name: 'Drumstick', category: 'vegetables', defaultUnit: 'pcs' },
        { id: 'veg-25', name: 'Gotukola', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-26', name: 'Mukunuwenna', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-27', name: 'Pandan Leaves', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-28', name: 'Lemongrass', category: 'vegetables', defaultUnit: 'bunch' },
        { id: 'veg-29', name: 'Mushrooms', category: 'vegetables', defaultUnit: 'pack' },
        { id: 'veg-30', name: 'Lettuce', category: 'vegetables', defaultUnit: 'pcs' },
        // Fruits
        { id: 'fruit-1', name: 'Apples', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-2', name: 'Bananas', category: 'fruits', defaultUnit: 'bunch' },
        { id: 'fruit-3', name: 'Oranges', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-4', name: 'Grapes', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-5', name: 'Mangoes', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-6', name: 'Pineapple', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-7', name: 'Papaya', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-8', name: 'Watermelon', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-9', name: 'Strawberries', category: 'fruits', defaultUnit: 'pack' },
        { id: 'fruit-10', name: 'Avocado', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-11', name: 'Coconut', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-12', name: 'King Coconut', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-13', name: 'Lime', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-14', name: 'Lemon', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-15', name: 'Pomegranate', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-16', name: 'Guava', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-17', name: 'Passion Fruit', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-18', name: 'Dragon Fruit', category: 'fruits', defaultUnit: 'pcs' },
        { id: 'fruit-19', name: 'Rambutan', category: 'fruits', defaultUnit: 'kg' },
        { id: 'fruit-20', name: 'Wood Apple', category: 'fruits', defaultUnit: 'pcs' },
        // Bread & Bakery
        { id: 'bread-1', name: 'White Bread', category: 'bread', defaultUnit: 'loaf' },
        { id: 'bread-2', name: 'Brown Bread', category: 'bread', defaultUnit: 'loaf' },
        { id: 'bread-3', name: 'Whole Wheat Bread', category: 'bread', defaultUnit: 'loaf' },
        { id: 'bread-4', name: 'Roti', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-5', name: 'Naan', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-6', name: 'Pita Bread', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-7', name: 'Croissants', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-8', name: 'Burger Buns', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-9', name: 'Hot Dog Buns', category: 'bread', defaultUnit: 'pack' },
        { id: 'bread-10', name: 'Cake', category: 'bread', defaultUnit: 'pcs' },
        // Beverages
        { id: 'bev-1', name: 'Mineral Water', category: 'beverages', defaultUnit: 'bottle' },
        { id: 'bev-2', name: 'Orange Juice', category: 'beverages', defaultUnit: 'L' },
        { id: 'bev-3', name: 'Apple Juice', category: 'beverages', defaultUnit: 'L' },
        { id: 'bev-4', name: 'Mango Juice', category: 'beverages', defaultUnit: 'L' },
        { id: 'bev-5', name: 'Coca Cola', category: 'beverages', defaultUnit: 'bottle' },
        { id: 'bev-6', name: 'Pepsi', category: 'beverages', defaultUnit: 'bottle' },
        { id: 'bev-7', name: 'Sprite', category: 'beverages', defaultUnit: 'bottle' },
        { id: 'bev-8', name: 'Tea', category: 'beverages', defaultUnit: 'pack' },
        { id: 'bev-9', name: 'Coffee', category: 'beverages', defaultUnit: 'pack' },
        { id: 'bev-10', name: 'Green Tea', category: 'beverages', defaultUnit: 'pack' },
        { id: 'bev-11', name: 'Energy Drink', category: 'beverages', defaultUnit: 'can' },
        { id: 'bev-12', name: 'Coconut Water', category: 'beverages', defaultUnit: 'bottle' },
        // Snacks
        { id: 'snack-1', name: 'Potato Chips', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-2', name: 'Biscuits', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-3', name: 'Cookies', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-4', name: 'Chocolate', category: 'snacks', defaultUnit: 'pcs' },
        { id: 'snack-5', name: 'Nuts (Mixed)', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-6', name: 'Cashew Nuts', category: 'snacks', defaultUnit: 'g' },
        { id: 'snack-7', name: 'Peanuts', category: 'snacks', defaultUnit: 'g' },
        { id: 'snack-8', name: 'Popcorn', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-9', name: 'Crackers', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-10', name: 'Murukku', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-11', name: 'Kavum', category: 'snacks', defaultUnit: 'pack' },
        { id: 'snack-12', name: 'Kokis', category: 'snacks', defaultUnit: 'pack' },
        // Rice & Grains
        { id: 'grain-1', name: 'White Rice', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-2', name: 'Red Rice', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-3', name: 'Basmati Rice', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-4', name: 'Samba Rice', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-5', name: 'Brown Rice', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-6', name: 'Dhal (Red Lentils)', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-7', name: 'Green Gram', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-8', name: 'Chickpeas', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-9', name: 'Black Gram', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-10', name: 'Oats', category: 'grains', defaultUnit: 'pack' },
        { id: 'grain-11', name: 'Wheat Flour', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-12', name: 'Rice Flour', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-13', name: 'Kurakkan Flour', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-14', name: 'Pasta', category: 'grains', defaultUnit: 'pack' },
        { id: 'grain-15', name: 'Noodles', category: 'grains', defaultUnit: 'pack' },
        { id: 'grain-16', name: 'Macaroni', category: 'grains', defaultUnit: 'pack' },
        { id: 'grain-17', name: 'Vermicelli', category: 'grains', defaultUnit: 'pack' },
        { id: 'grain-18', name: 'Semolina', category: 'grains', defaultUnit: 'kg' },
        { id: 'grain-19', name: 'Cornflour', category: 'grains', defaultUnit: 'g' },
        { id: 'grain-20', name: 'Quinoa', category: 'grains', defaultUnit: 'pack' },
        // Spices & Seasonings
        { id: 'spice-1', name: 'Salt', category: 'spices', defaultUnit: 'pack' },
        { id: 'spice-2', name: 'Black Pepper', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-3', name: 'Turmeric Powder', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-4', name: 'Chili Powder', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-5', name: 'Curry Powder', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-6', name: 'Cumin', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-7', name: 'Coriander Powder', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-8', name: 'Cinnamon', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-9', name: 'Cardamom', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-10', name: 'Cloves', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-11', name: 'Mustard Seeds', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-12', name: 'Fenugreek', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-13', name: 'Fennel Seeds', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-14', name: 'Garam Masala', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-15', name: 'Soy Sauce', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-16', name: 'Vinegar', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-17', name: 'Tomato Sauce', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-18', name: 'Chili Sauce', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-19', name: 'Coconut Oil', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-20', name: 'Vegetable Oil', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-21', name: 'Olive Oil', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-22', name: 'Sugar', category: 'spices', defaultUnit: 'kg' },
        { id: 'spice-23', name: 'Jaggery', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-24', name: 'Honey', category: 'spices', defaultUnit: 'bottle' },
        { id: 'spice-25', name: 'Tamarind', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-26', name: 'Goraka', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-27', name: 'Maldive Fish', category: 'spices', defaultUnit: 'g' },
        { id: 'spice-28', name: 'Coconut Milk', category: 'spices', defaultUnit: 'can' },
        { id: 'spice-29', name: 'Coconut Cream', category: 'spices', defaultUnit: 'can' },
        { id: 'spice-30', name: 'Mayonnaise', category: 'spices', defaultUnit: 'bottle' },
        // Frozen Foods
        { id: 'frozen-1', name: 'Frozen Vegetables', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-2', name: 'Frozen Fish', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-3', name: 'Frozen Prawns', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-4', name: 'Ice Cream', category: 'frozen', defaultUnit: 'tub' },
        { id: 'frozen-5', name: 'Frozen Pizza', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-6', name: 'Frozen Fries', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-7', name: 'Frozen Chicken Nuggets', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-8', name: 'Frozen Samosa', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-9', name: 'Frozen Paratha', category: 'frozen', defaultUnit: 'pack' },
        { id: 'frozen-10', name: 'Ice Cubes', category: 'frozen', defaultUnit: 'pack' },
        // Canned Goods
        { id: 'can-1', name: 'Canned Tuna', category: 'canned', defaultUnit: 'can' },
        { id: 'can-2', name: 'Canned Sardines', category: 'canned', defaultUnit: 'can' },
        { id: 'can-3', name: 'Canned Beans', category: 'canned', defaultUnit: 'can' },
        { id: 'can-4', name: 'Canned Corn', category: 'canned', defaultUnit: 'can' },
        { id: 'can-5', name: 'Canned Tomatoes', category: 'canned', defaultUnit: 'can' },
        { id: 'can-6', name: 'Canned Mushrooms', category: 'canned', defaultUnit: 'can' },
        { id: 'can-7', name: 'Canned Pineapple', category: 'canned', defaultUnit: 'can' },
        { id: 'can-8', name: 'Canned Peaches', category: 'canned', defaultUnit: 'can' },
        { id: 'can-9', name: 'Condensed Soup', category: 'canned', defaultUnit: 'can' },
        { id: 'can-10', name: 'Baked Beans', category: 'canned', defaultUnit: 'can' },
        // Household
        { id: 'house-1', name: 'Dish Soap', category: 'household', defaultUnit: 'bottle' },
        { id: 'house-2', name: 'Laundry Detergent', category: 'household', defaultUnit: 'pack' },
        { id: 'house-3', name: 'Fabric Softener', category: 'household', defaultUnit: 'bottle' },
        { id: 'house-4', name: 'Floor Cleaner', category: 'household', defaultUnit: 'bottle' },
        { id: 'house-5', name: 'Glass Cleaner', category: 'household', defaultUnit: 'bottle' },
        { id: 'house-6', name: 'Toilet Cleaner', category: 'household', defaultUnit: 'bottle' },
        { id: 'house-7', name: 'Sponges', category: 'household', defaultUnit: 'pack' },
        { id: 'house-8', name: 'Trash Bags', category: 'household', defaultUnit: 'pack' },
        { id: 'house-9', name: 'Paper Towels', category: 'household', defaultUnit: 'pack' },
        { id: 'house-10', name: 'Toilet Paper', category: 'household', defaultUnit: 'pack' },
        { id: 'house-11', name: 'Tissues', category: 'household', defaultUnit: 'box' },
        { id: 'house-12', name: 'Aluminum Foil', category: 'household', defaultUnit: 'roll' },
        { id: 'house-13', name: 'Plastic Wrap', category: 'household', defaultUnit: 'roll' },
        { id: 'house-14', name: 'Matches', category: 'household', defaultUnit: 'box' },
        { id: 'house-15', name: 'Candles', category: 'household', defaultUnit: 'pack' },
        // Personal Care
        { id: 'personal-1', name: 'Toothpaste', category: 'personal', defaultUnit: 'tube' },
        { id: 'personal-2', name: 'Toothbrush', category: 'personal', defaultUnit: 'pcs' },
        { id: 'personal-3', name: 'Shampoo', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-4', name: 'Conditioner', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-5', name: 'Body Wash', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-6', name: 'Soap', category: 'personal', defaultUnit: 'pcs' },
        { id: 'personal-7', name: 'Deodorant', category: 'personal', defaultUnit: 'pcs' },
        { id: 'personal-8', name: 'Face Wash', category: 'personal', defaultUnit: 'tube' },
        { id: 'personal-9', name: 'Moisturizer', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-10', name: 'Sunscreen', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-11', name: 'Razor', category: 'personal', defaultUnit: 'pack' },
        { id: 'personal-12', name: 'Shaving Cream', category: 'personal', defaultUnit: 'can' },
        { id: 'personal-13', name: 'Hand Sanitizer', category: 'personal', defaultUnit: 'bottle' },
        { id: 'personal-14', name: 'Cotton Buds', category: 'personal', defaultUnit: 'pack' },
        { id: 'personal-15', name: 'Band-Aids', category: 'personal', defaultUnit: 'box' },
      ];
      
      for (const item of items) {
        await connection.execute(
          'INSERT INTO shop_items (id, name, category, default_unit, in_stock) VALUES (?, ?, ?, ?, 1)',
          [item.id, item.name, item.category, item.defaultUnit]
        );
      }
      console.log('✅ Shop items initialized (204 items)');
    }
  } finally {
    connection.release();
  }
}

// =====================
// HELPER FUNCTIONS
// =====================

function rowToGroceryItem(row: any): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity ? parseFloat(row.quantity) : undefined,
    unit: row.unit || undefined,
    purchasedDate: row.purchased_date ? new Date(row.purchased_date) : undefined,
    expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
    isPurchased: Boolean(row.is_purchased),
    isExpiring: Boolean(row.is_expiring)
  };
}

function rowToShopItem(row: any): ShopItemDB {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.default_unit,
    image: row.image || undefined,
    price: row.price ? parseFloat(row.price) : undefined,
    inStock: Boolean(row.in_stock)
  };
}

// Close connection pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}


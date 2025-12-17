import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
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

// Database file path
const dbPath = path.join(process.cwd(), 'src', 'data', 'grocery.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance
    initializeDatabase();
  }
  return db;
}

// Initialize database schema
function initializeDatabase() {
  const database = getDatabase();
  
  // Grocery items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS grocery_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      purchased_date TEXT,
      expiry_date TEXT,
      is_purchased INTEGER DEFAULT 0,
      is_expiring INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Purchase history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS purchase_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      last_purchased TEXT NOT NULL,
      frequency INTEGER NOT NULL,
      purchase_count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(item_name, category)
    )
  `);

  // Shop categories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS shop_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Shop items table (store catalog)
  database.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_unit TEXT NOT NULL,
      image TEXT,
      price REAL,
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category) REFERENCES shop_categories(id)
    )
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_grocery_category ON grocery_items(category);
    CREATE INDEX IF NOT EXISTS idx_grocery_purchased ON grocery_items(is_purchased);
    CREATE INDEX IF NOT EXISTS idx_history_item_name ON purchase_history(item_name);
    CREATE INDEX IF NOT EXISTS idx_history_last_purchased ON purchase_history(last_purchased);
    CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category);
    CREATE INDEX IF NOT EXISTS idx_shop_items_name ON shop_items(name);
  `);
}

// Convert database row to GroceryItem
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

// Convert GroceryItem to database row
function groceryItemToRow(item: Partial<GroceryItem>): any {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity !== undefined ? item.quantity : null,
    unit: item.unit || null,
    purchased_date: item.purchasedDate ? item.purchasedDate.toISOString() : null,
    expiry_date: item.expiryDate ? item.expiryDate.toISOString() : null,
    is_purchased: item.isPurchased ? 1 : 0,
    is_expiring: item.isExpiring ? 1 : 0,
    updated_at: new Date().toISOString()
  };
}

// Grocery Items CRUD operations
export function getAllGroceryItems(): GroceryItem[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM grocery_items ORDER BY created_at DESC').all();
  return rows.map(rowToGroceryItem);
}

export function getGroceryItemById(id: string): GroceryItem | null {
  const database = getDatabase();
  const row = database.prepare('SELECT * FROM grocery_items WHERE id = ?').get(id);
  return row ? rowToGroceryItem(row) : null;
}

export function addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem {
  const database = getDatabase();
  const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem: GroceryItem = {
    ...item,
    id
  };
  
  const row = groceryItemToRow(newItem);
  database.prepare(`
    INSERT INTO grocery_items (id, name, category, quantity, unit, purchased_date, expiry_date, is_purchased, is_expiring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id,
    row.name,
    row.category,
    row.quantity,
    row.unit,
    row.purchased_date,
    row.expiry_date,
    row.is_purchased,
    row.is_expiring
  );
  
  return newItem;
}

export function updateGroceryItem(id: string, updates: Partial<GroceryItem>): GroceryItem | null {
  const database = getDatabase();
  const existing = getGroceryItemById(id);
  
  if (!existing) {
    return null;
  }
  
  const updated = { ...existing, ...updates };
  const row = groceryItemToRow(updated);
  
  database.prepare(`
    UPDATE grocery_items 
    SET name = ?, category = ?, quantity = ?, unit = ?, purchased_date = ?, 
        expiry_date = ?, is_purchased = ?, is_expiring = ?, updated_at = ?
    WHERE id = ?
  `).run(
    row.name,
    row.category,
    row.quantity,
    row.unit,
    row.purchased_date,
    row.expiry_date,
    row.is_purchased,
    row.is_expiring,
    row.updated_at,
    id
  );
  
  return updated;
}

export function deleteGroceryItem(id: string): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM grocery_items WHERE id = ?').run(id);
  return result.changes > 0;
}

// Purchase History operations
export function getAllPurchaseHistory(): PurchaseHistory[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM purchase_history ORDER BY last_purchased DESC').all();
  return rows.map((row: any) => ({
    itemName: row.item_name,
    category: row.category,
    lastPurchased: new Date(row.last_purchased),
    frequency: row.frequency
  }));
}

export function getPurchaseHistoryByItemName(itemName: string): PurchaseHistory | null {
  const database = getDatabase();
  const row = database.prepare('SELECT * FROM purchase_history WHERE LOWER(item_name) = LOWER(?)').get(itemName);
  return row ? {
    itemName: (row as any).item_name,
    category: (row as any).category,
    lastPurchased: new Date((row as any).last_purchased),
    frequency: (row as any).frequency
  } : null;
}

export function addOrUpdatePurchaseHistory(history: PurchaseHistory): void {
  const database = getDatabase();
  const existing = getPurchaseHistoryByItemName(history.itemName);
  
  if (existing) {
    // Update existing history
    database.prepare(`
      UPDATE purchase_history 
      SET last_purchased = ?, frequency = ?, purchase_count = purchase_count + 1, updated_at = ?
      WHERE LOWER(item_name) = LOWER(?)
    `).run(
      history.lastPurchased.toISOString(),
      history.frequency,
      new Date().toISOString(),
      history.itemName
    );
  } else {
    // Insert new history
    database.prepare(`
      INSERT INTO purchase_history (item_name, category, last_purchased, frequency, purchase_count)
      VALUES (?, ?, ?, ?, 1)
    `).run(
      history.itemName,
      history.category,
      history.lastPurchased.toISOString(),
      history.frequency
    );
  }
}

// Initialize sample data
export function initializeSampleData() {
  const database = getDatabase();
  
  // Check if data already exists
  const count = database.prepare('SELECT COUNT(*) as count FROM purchase_history').get() as { count: number };
  
  if (count.count === 0) {
    const sampleHistory: PurchaseHistory[] = [
      {
        itemName: 'milk',
        lastPurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'dairy'
      },
      {
        itemName: 'bread',
        lastPurchased: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        frequency: 5,
        category: 'bread'
      },
      {
        itemName: 'eggs',
        lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'dairy'
      },
      {
        itemName: 'bananas',
        lastPurchased: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        frequency: 5,
        category: 'fruits'
      },
      {
        itemName: 'rice',
        lastPurchased: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'other'
      },
      {
        itemName: 'coconut',
        lastPurchased: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        frequency: 5,
        category: 'other'
      },
      {
        itemName: 'curry leaves',
        lastPurchased: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'pandan leaves',
        lastPurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'dhal',
        lastPurchased: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'turmeric',
        lastPurchased: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        frequency: 14,
        category: 'vegetables'
      },
      {
        itemName: 'cinnamon',
        lastPurchased: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        frequency: 30,
        category: 'other'
      },
      {
        itemName: 'coconut oil',
        lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        frequency: 14,
        category: 'other'
      },
      {
        itemName: 'king coconut',
        lastPurchased: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        frequency: 5,
        category: 'fruits'
      },
      {
        itemName: 'gotukola',
        lastPurchased: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        frequency: 3,
        category: 'vegetables'
      }
    ];
    
    const insertStmt = database.prepare(`
      INSERT INTO purchase_history (item_name, category, last_purchased, frequency, purchase_count)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    const insertMany = database.transaction((histories: PurchaseHistory[]) => {
      for (const history of histories) {
        insertStmt.run(
          history.itemName,
          history.category,
          history.lastPurchased.toISOString(),
          history.frequency
        );
      }
    });
    
    insertMany(sampleHistory);
  }
}

// Close database connection (useful for cleanup)
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// =====================
// SHOP CATEGORIES CRUD
// =====================

export function getAllShopCategories(): ShopCategoryDB[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM shop_categories ORDER BY sort_order ASC').all();
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sort_order
  }));
}

export function getShopCategoryById(id: string): ShopCategoryDB | null {
  const database = getDatabase();
  const row = database.prepare('SELECT * FROM shop_categories WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: (row as any).id,
    name: (row as any).name,
    icon: (row as any).icon,
    sortOrder: (row as any).sort_order
  };
}

export function addShopCategory(category: Omit<ShopCategoryDB, 'createdAt' | 'updatedAt'>): ShopCategoryDB {
  const database = getDatabase();
  database.prepare(`
    INSERT INTO shop_categories (id, name, icon, sort_order)
    VALUES (?, ?, ?, ?)
  `).run(category.id, category.name, category.icon, category.sortOrder);
  return category;
}

export function updateShopCategory(id: string, updates: Partial<ShopCategoryDB>): ShopCategoryDB | null {
  const database = getDatabase();
  const existing = getShopCategoryById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  database.prepare(`
    UPDATE shop_categories 
    SET name = ?, icon = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(updated.name, updated.icon, updated.sortOrder, new Date().toISOString(), id);
  return updated;
}

export function deleteShopCategory(id: string): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM shop_categories WHERE id = ?').run(id);
  return result.changes > 0;
}

// =====================
// SHOP ITEMS CRUD
// =====================

export function getAllShopItems(): ShopItemDB[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM shop_items ORDER BY name ASC').all();
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.default_unit,
    image: row.image || undefined,
    price: row.price || undefined,
    inStock: Boolean(row.in_stock)
  }));
}

export function getShopItemById(id: string): ShopItemDB | null {
  const database = getDatabase();
  const row = database.prepare('SELECT * FROM shop_items WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: (row as any).id,
    name: (row as any).name,
    category: (row as any).category,
    defaultUnit: (row as any).default_unit,
    image: (row as any).image || undefined,
    price: (row as any).price || undefined,
    inStock: Boolean((row as any).in_stock)
  };
}

export function getShopItemsByCategory(categoryId: string): ShopItemDB[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM shop_items WHERE category = ? ORDER BY name ASC').all(categoryId);
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.default_unit,
    image: row.image || undefined,
    price: row.price || undefined,
    inStock: Boolean(row.in_stock)
  }));
}

export function searchShopItemsDB(query: string): ShopItemDB[] {
  const database = getDatabase();
  const rows = database.prepare(`
    SELECT * FROM shop_items 
    WHERE LOWER(name) LIKE LOWER(?)
    ORDER BY name ASC
  `).all(`%${query}%`);
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.default_unit,
    image: row.image || undefined,
    price: row.price || undefined,
    inStock: Boolean(row.in_stock)
  }));
}

export function addShopItem(item: Omit<ShopItemDB, 'createdAt' | 'updatedAt'>): ShopItemDB {
  const database = getDatabase();
  database.prepare(`
    INSERT INTO shop_items (id, name, category, default_unit, image, price, in_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.id,
    item.name,
    item.category,
    item.defaultUnit,
    item.image || null,
    item.price || null,
    item.inStock ? 1 : 0
  );
  return item;
}

export function updateShopItem(id: string, updates: Partial<ShopItemDB>): ShopItemDB | null {
  const database = getDatabase();
  const existing = getShopItemById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  database.prepare(`
    UPDATE shop_items 
    SET name = ?, category = ?, default_unit = ?, image = ?, price = ?, in_stock = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.name,
    updated.category,
    updated.defaultUnit,
    updated.image || null,
    updated.price || null,
    updated.inStock ? 1 : 0,
    new Date().toISOString(),
    id
  );
  return updated;
}

export function deleteShopItem(id: string): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM shop_items WHERE id = ?').run(id);
  return result.changes > 0;
}

// Get categories with item counts
export function getCategoriesWithItemCounts(): { category: ShopCategoryDB; count: number }[] {
  const database = getDatabase();
  const categories = getAllShopCategories();
  
  return categories.map(cat => {
    const result = database.prepare('SELECT COUNT(*) as count FROM shop_items WHERE category = ?').get(cat.id) as { count: number };
    return {
      category: cat,
      count: result.count
    };
  });
}

// Initialize shop data from static file
export function initializeShopData() {
  const database = getDatabase();
  
  // Check if shop categories already exist
  const categoryCount = database.prepare('SELECT COUNT(*) as count FROM shop_categories').get() as { count: number };
  
  if (categoryCount.count === 0) {
    // Default shop categories
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

    const insertCatStmt = database.prepare(`
      INSERT INTO shop_categories (id, name, icon, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    const insertCategories = database.transaction((cats: typeof categories) => {
      for (const cat of cats) {
        insertCatStmt.run(cat.id, cat.name, cat.icon, cat.sortOrder);
      }
    });

    insertCategories(categories);
  }

  // Check if shop items already exist
  const itemCount = database.prepare('SELECT COUNT(*) as count FROM shop_items').get() as { count: number };
  
  if (itemCount.count === 0) {
    // All shop items
    const items = [
      // Dairy & Eggs
      { id: 'dairy-1', name: 'Milk', category: 'dairy', defaultUnit: 'L', inStock: true },
      { id: 'dairy-2', name: 'Eggs', category: 'dairy', defaultUnit: 'pcs', inStock: true },
      { id: 'dairy-3', name: 'Butter', category: 'dairy', defaultUnit: 'g', inStock: true },
      { id: 'dairy-4', name: 'Cheese', category: 'dairy', defaultUnit: 'g', inStock: true },
      { id: 'dairy-5', name: 'Yogurt', category: 'dairy', defaultUnit: 'pcs', inStock: true },
      { id: 'dairy-6', name: 'Curd', category: 'dairy', defaultUnit: 'g', inStock: true },
      { id: 'dairy-7', name: 'Cream', category: 'dairy', defaultUnit: 'mL', inStock: true },
      { id: 'dairy-8', name: 'Ghee', category: 'dairy', defaultUnit: 'g', inStock: true },
      { id: 'dairy-9', name: 'Condensed Milk', category: 'dairy', defaultUnit: 'g', inStock: true },
      { id: 'dairy-10', name: 'Paneer', category: 'dairy', defaultUnit: 'g', inStock: true },

      // Meat & Seafood
      { id: 'meat-1', name: 'Chicken Breast', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-2', name: 'Chicken Whole', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-3', name: 'Beef', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-4', name: 'Mutton', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-5', name: 'Fish', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-6', name: 'Prawns', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-7', name: 'Crab', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-8', name: 'Salmon', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-9', name: 'Tuna', category: 'meat', defaultUnit: 'kg', inStock: true },
      { id: 'meat-10', name: 'Sausages', category: 'meat', defaultUnit: 'pack', inStock: true },

      // Vegetables
      { id: 'veg-1', name: 'Tomatoes', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-2', name: 'Onions', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-3', name: 'Potatoes', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-4', name: 'Carrots', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-5', name: 'Cabbage', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-6', name: 'Spinach', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-7', name: 'Broccoli', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-8', name: 'Cauliflower', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-9', name: 'Green Beans', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-10', name: 'Peas', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-11', name: 'Cucumber', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-12', name: 'Bell Peppers', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-13', name: 'Garlic', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-14', name: 'Ginger', category: 'vegetables', defaultUnit: 'g', inStock: true },
      { id: 'veg-15', name: 'Green Chili', category: 'vegetables', defaultUnit: 'g', inStock: true },
      { id: 'veg-16', name: 'Curry Leaves', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-17', name: 'Coriander Leaves', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-18', name: 'Mint Leaves', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-19', name: 'Leeks', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-20', name: 'Pumpkin', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-21', name: 'Bitter Gourd', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-22', name: 'Eggplant', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-23', name: 'Okra (Ladies Finger)', category: 'vegetables', defaultUnit: 'kg', inStock: true },
      { id: 'veg-24', name: 'Drumstick', category: 'vegetables', defaultUnit: 'pcs', inStock: true },
      { id: 'veg-25', name: 'Gotukola', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-26', name: 'Mukunuwenna', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-27', name: 'Pandan Leaves', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-28', name: 'Lemongrass', category: 'vegetables', defaultUnit: 'bunch', inStock: true },
      { id: 'veg-29', name: 'Mushrooms', category: 'vegetables', defaultUnit: 'pack', inStock: true },
      { id: 'veg-30', name: 'Lettuce', category: 'vegetables', defaultUnit: 'pcs', inStock: true },

      // Fruits
      { id: 'fruit-1', name: 'Apples', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-2', name: 'Bananas', category: 'fruits', defaultUnit: 'bunch', inStock: true },
      { id: 'fruit-3', name: 'Oranges', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-4', name: 'Grapes', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-5', name: 'Mangoes', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-6', name: 'Pineapple', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-7', name: 'Papaya', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-8', name: 'Watermelon', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-9', name: 'Strawberries', category: 'fruits', defaultUnit: 'pack', inStock: true },
      { id: 'fruit-10', name: 'Avocado', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-11', name: 'Coconut', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-12', name: 'King Coconut', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-13', name: 'Lime', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-14', name: 'Lemon', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-15', name: 'Pomegranate', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-16', name: 'Guava', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-17', name: 'Passion Fruit', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-18', name: 'Dragon Fruit', category: 'fruits', defaultUnit: 'pcs', inStock: true },
      { id: 'fruit-19', name: 'Rambutan', category: 'fruits', defaultUnit: 'kg', inStock: true },
      { id: 'fruit-20', name: 'Wood Apple', category: 'fruits', defaultUnit: 'pcs', inStock: true },

      // Bread & Bakery
      { id: 'bread-1', name: 'White Bread', category: 'bread', defaultUnit: 'loaf', inStock: true },
      { id: 'bread-2', name: 'Brown Bread', category: 'bread', defaultUnit: 'loaf', inStock: true },
      { id: 'bread-3', name: 'Whole Wheat Bread', category: 'bread', defaultUnit: 'loaf', inStock: true },
      { id: 'bread-4', name: 'Roti', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-5', name: 'Naan', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-6', name: 'Pita Bread', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-7', name: 'Croissants', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-8', name: 'Burger Buns', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-9', name: 'Hot Dog Buns', category: 'bread', defaultUnit: 'pack', inStock: true },
      { id: 'bread-10', name: 'Cake', category: 'bread', defaultUnit: 'pcs', inStock: true },

      // Beverages
      { id: 'bev-1', name: 'Mineral Water', category: 'beverages', defaultUnit: 'bottle', inStock: true },
      { id: 'bev-2', name: 'Orange Juice', category: 'beverages', defaultUnit: 'L', inStock: true },
      { id: 'bev-3', name: 'Apple Juice', category: 'beverages', defaultUnit: 'L', inStock: true },
      { id: 'bev-4', name: 'Mango Juice', category: 'beverages', defaultUnit: 'L', inStock: true },
      { id: 'bev-5', name: 'Coca Cola', category: 'beverages', defaultUnit: 'bottle', inStock: true },
      { id: 'bev-6', name: 'Pepsi', category: 'beverages', defaultUnit: 'bottle', inStock: true },
      { id: 'bev-7', name: 'Sprite', category: 'beverages', defaultUnit: 'bottle', inStock: true },
      { id: 'bev-8', name: 'Tea', category: 'beverages', defaultUnit: 'pack', inStock: true },
      { id: 'bev-9', name: 'Coffee', category: 'beverages', defaultUnit: 'pack', inStock: true },
      { id: 'bev-10', name: 'Green Tea', category: 'beverages', defaultUnit: 'pack', inStock: true },
      { id: 'bev-11', name: 'Energy Drink', category: 'beverages', defaultUnit: 'can', inStock: true },
      { id: 'bev-12', name: 'Coconut Water', category: 'beverages', defaultUnit: 'bottle', inStock: true },

      // Snacks
      { id: 'snack-1', name: 'Potato Chips', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-2', name: 'Biscuits', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-3', name: 'Cookies', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-4', name: 'Chocolate', category: 'snacks', defaultUnit: 'pcs', inStock: true },
      { id: 'snack-5', name: 'Nuts (Mixed)', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-6', name: 'Cashew Nuts', category: 'snacks', defaultUnit: 'g', inStock: true },
      { id: 'snack-7', name: 'Peanuts', category: 'snacks', defaultUnit: 'g', inStock: true },
      { id: 'snack-8', name: 'Popcorn', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-9', name: 'Crackers', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-10', name: 'Murukku', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-11', name: 'Kavum', category: 'snacks', defaultUnit: 'pack', inStock: true },
      { id: 'snack-12', name: 'Kokis', category: 'snacks', defaultUnit: 'pack', inStock: true },

      // Rice & Grains
      { id: 'grain-1', name: 'White Rice', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-2', name: 'Red Rice', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-3', name: 'Basmati Rice', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-4', name: 'Samba Rice', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-5', name: 'Brown Rice', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-6', name: 'Dhal (Red Lentils)', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-7', name: 'Green Gram', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-8', name: 'Chickpeas', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-9', name: 'Black Gram', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-10', name: 'Oats', category: 'grains', defaultUnit: 'pack', inStock: true },
      { id: 'grain-11', name: 'Wheat Flour', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-12', name: 'Rice Flour', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-13', name: 'Kurakkan Flour', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-14', name: 'Pasta', category: 'grains', defaultUnit: 'pack', inStock: true },
      { id: 'grain-15', name: 'Noodles', category: 'grains', defaultUnit: 'pack', inStock: true },
      { id: 'grain-16', name: 'Macaroni', category: 'grains', defaultUnit: 'pack', inStock: true },
      { id: 'grain-17', name: 'Vermicelli', category: 'grains', defaultUnit: 'pack', inStock: true },
      { id: 'grain-18', name: 'Semolina', category: 'grains', defaultUnit: 'kg', inStock: true },
      { id: 'grain-19', name: 'Cornflour', category: 'grains', defaultUnit: 'g', inStock: true },
      { id: 'grain-20', name: 'Quinoa', category: 'grains', defaultUnit: 'pack', inStock: true },

      // Spices & Seasonings
      { id: 'spice-1', name: 'Salt', category: 'spices', defaultUnit: 'pack', inStock: true },
      { id: 'spice-2', name: 'Black Pepper', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-3', name: 'Turmeric Powder', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-4', name: 'Chili Powder', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-5', name: 'Curry Powder', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-6', name: 'Cumin', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-7', name: 'Coriander Powder', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-8', name: 'Cinnamon', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-9', name: 'Cardamom', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-10', name: 'Cloves', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-11', name: 'Mustard Seeds', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-12', name: 'Fenugreek', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-13', name: 'Fennel Seeds', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-14', name: 'Garam Masala', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-15', name: 'Soy Sauce', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-16', name: 'Vinegar', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-17', name: 'Tomato Sauce', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-18', name: 'Chili Sauce', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-19', name: 'Coconut Oil', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-20', name: 'Vegetable Oil', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-21', name: 'Olive Oil', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-22', name: 'Sugar', category: 'spices', defaultUnit: 'kg', inStock: true },
      { id: 'spice-23', name: 'Jaggery', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-24', name: 'Honey', category: 'spices', defaultUnit: 'bottle', inStock: true },
      { id: 'spice-25', name: 'Tamarind', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-26', name: 'Goraka', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-27', name: 'Maldive Fish', category: 'spices', defaultUnit: 'g', inStock: true },
      { id: 'spice-28', name: 'Coconut Milk', category: 'spices', defaultUnit: 'can', inStock: true },
      { id: 'spice-29', name: 'Coconut Cream', category: 'spices', defaultUnit: 'can', inStock: true },
      { id: 'spice-30', name: 'Mayonnaise', category: 'spices', defaultUnit: 'bottle', inStock: true },

      // Frozen Foods
      { id: 'frozen-1', name: 'Frozen Vegetables', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-2', name: 'Frozen Fish', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-3', name: 'Frozen Prawns', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-4', name: 'Ice Cream', category: 'frozen', defaultUnit: 'tub', inStock: true },
      { id: 'frozen-5', name: 'Frozen Pizza', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-6', name: 'Frozen Fries', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-7', name: 'Frozen Chicken Nuggets', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-8', name: 'Frozen Samosa', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-9', name: 'Frozen Paratha', category: 'frozen', defaultUnit: 'pack', inStock: true },
      { id: 'frozen-10', name: 'Ice Cubes', category: 'frozen', defaultUnit: 'pack', inStock: true },

      // Canned Goods
      { id: 'can-1', name: 'Canned Tuna', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-2', name: 'Canned Sardines', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-3', name: 'Canned Beans', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-4', name: 'Canned Corn', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-5', name: 'Canned Tomatoes', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-6', name: 'Canned Mushrooms', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-7', name: 'Canned Pineapple', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-8', name: 'Canned Peaches', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-9', name: 'Condensed Soup', category: 'canned', defaultUnit: 'can', inStock: true },
      { id: 'can-10', name: 'Baked Beans', category: 'canned', defaultUnit: 'can', inStock: true },

      // Household
      { id: 'house-1', name: 'Dish Soap', category: 'household', defaultUnit: 'bottle', inStock: true },
      { id: 'house-2', name: 'Laundry Detergent', category: 'household', defaultUnit: 'pack', inStock: true },
      { id: 'house-3', name: 'Fabric Softener', category: 'household', defaultUnit: 'bottle', inStock: true },
      { id: 'house-4', name: 'Floor Cleaner', category: 'household', defaultUnit: 'bottle', inStock: true },
      { id: 'house-5', name: 'Glass Cleaner', category: 'household', defaultUnit: 'bottle', inStock: true },
      { id: 'house-6', name: 'Toilet Cleaner', category: 'household', defaultUnit: 'bottle', inStock: true },
      { id: 'house-7', name: 'Sponges', category: 'household', defaultUnit: 'pack', inStock: true },
      { id: 'house-8', name: 'Trash Bags', category: 'household', defaultUnit: 'pack', inStock: true },
      { id: 'house-9', name: 'Paper Towels', category: 'household', defaultUnit: 'pack', inStock: true },
      { id: 'house-10', name: 'Toilet Paper', category: 'household', defaultUnit: 'pack', inStock: true },
      { id: 'house-11', name: 'Tissues', category: 'household', defaultUnit: 'box', inStock: true },
      { id: 'house-12', name: 'Aluminum Foil', category: 'household', defaultUnit: 'roll', inStock: true },
      { id: 'house-13', name: 'Plastic Wrap', category: 'household', defaultUnit: 'roll', inStock: true },
      { id: 'house-14', name: 'Matches', category: 'household', defaultUnit: 'box', inStock: true },
      { id: 'house-15', name: 'Candles', category: 'household', defaultUnit: 'pack', inStock: true },

      // Personal Care
      { id: 'personal-1', name: 'Toothpaste', category: 'personal', defaultUnit: 'tube', inStock: true },
      { id: 'personal-2', name: 'Toothbrush', category: 'personal', defaultUnit: 'pcs', inStock: true },
      { id: 'personal-3', name: 'Shampoo', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-4', name: 'Conditioner', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-5', name: 'Body Wash', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-6', name: 'Soap', category: 'personal', defaultUnit: 'pcs', inStock: true },
      { id: 'personal-7', name: 'Deodorant', category: 'personal', defaultUnit: 'pcs', inStock: true },
      { id: 'personal-8', name: 'Face Wash', category: 'personal', defaultUnit: 'tube', inStock: true },
      { id: 'personal-9', name: 'Moisturizer', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-10', name: 'Sunscreen', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-11', name: 'Razor', category: 'personal', defaultUnit: 'pack', inStock: true },
      { id: 'personal-12', name: 'Shaving Cream', category: 'personal', defaultUnit: 'can', inStock: true },
      { id: 'personal-13', name: 'Hand Sanitizer', category: 'personal', defaultUnit: 'bottle', inStock: true },
      { id: 'personal-14', name: 'Cotton Buds', category: 'personal', defaultUnit: 'pack', inStock: true },
      { id: 'personal-15', name: 'Band-Aids', category: 'personal', defaultUnit: 'box', inStock: true },
    ];

    const insertItemStmt = database.prepare(`
      INSERT INTO shop_items (id, name, category, default_unit, in_stock)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertItems = database.transaction((shopItems: typeof items) => {
      for (const item of shopItems) {
        insertItemStmt.run(item.id, item.name, item.category, item.defaultUnit, item.inStock ? 1 : 0);
      }
    });

    insertItems(items);
  }
}



import mysql from 'mysql2/promise';
import { GroceryItem, PurchaseHistory } from '@/types';
import { SHOP_ITEMS, SHOP_CATEGORIES } from '@/lib/shopItems';

// MySQL connection configuration
const dbName = process.env.DB_NAME || 'grocery_db';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
let pool: mysql.Pool | null = null;
let tablesInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Ensure database exists and is initialized
async function ensureDatabaseInitialized(): Promise<void> {
  if (tablesInitialized) return;
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    // First, connect without database to create it
    const tempConfig: any = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 1
    };
    
    const tempPool = mysql.createPool(tempConfig);
    const tempConnection = await tempPool.getConnection();
    
    try {
      // Create database if it doesn't exist
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    } finally {
      tempConnection.release();
      await tempPool.end();
    }
    
    // Now create the main pool with the database
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    
    // Create tables
    const connection = await pool.getConnection();
    
    try {

    // Grocery items table with proper date handling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity DECIMAL(10, 2),
        unit VARCHAR(50),
        purchasedDate DATETIME NULL,
        expiryDate DATETIME NULL,
        isPurchased BOOLEAN NOT NULL DEFAULT FALSE,
        isExpiring BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_isPurchased (isPurchased)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Purchase history table with proper date handling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_history (
        itemName VARCHAR(255) PRIMARY KEY,
        lastPurchased DATETIME NOT NULL,
        frequency INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_lastPurchased (lastPurchased)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Shop items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        defaultUnit VARCHAR(50) NOT NULL,
        image VARCHAR(500),
        price DECIMAL(10, 2),
        inStock BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_name (name),
        INDEX idx_inStock (inStock)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    } finally {
      connection.release();
    }
    
    tablesInitialized = true;
  })();
  
  return initializationPromise;
}

// Initialize database connection pool
async function getPool(): Promise<mysql.Pool> {
  await ensureDatabaseInitialized();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

// ==================== GROCERY ITEMS ====================

export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM grocery_items ORDER BY createdAt DESC'
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    purchasedDate: row.purchasedDate ? new Date(row.purchasedDate) : undefined,
    expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
    isPurchased: Boolean(row.isPurchased),
    isExpiring: Boolean(row.isExpiring)
  }));
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  const pool = await getPool();
  const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem: GroceryItem = {
    id,
    ...item
  };

  await pool.query(
    `INSERT INTO grocery_items 
     (id, name, category, quantity, unit, purchasedDate, expiryDate, isPurchased, isExpiring)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newItem.id,
      newItem.name,
      newItem.category,
      newItem.quantity ?? null,
      newItem.unit ?? null,
      newItem.purchasedDate ? new Date(newItem.purchasedDate) : null,
      newItem.expiryDate ? new Date(newItem.expiryDate) : null,
      newItem.isPurchased ? 1 : 0,
      newItem.isExpiring ? 1 : 0
    ]
  );

  return newItem;
}

export async function deleteGroceryItem(id: string): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM grocery_items WHERE id = ?', [id]) as [any, any];
  return result.affectedRows > 0;
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM grocery_items WHERE id = ?', [id]) as [any[], any];
  
  if (rows.length === 0) {
    return null;
  }

  const existing = rows[0];
  const updated: GroceryItem = {
    id: existing.id,
    name: updates.name ?? existing.name,
    category: updates.category ?? existing.category,
    quantity: updates.quantity !== undefined ? updates.quantity : (existing.quantity ?? undefined),
    unit: updates.unit !== undefined ? updates.unit : (existing.unit ?? undefined),
    purchasedDate: updates.purchasedDate !== undefined 
      ? updates.purchasedDate 
      : (existing.purchasedDate ? new Date(existing.purchasedDate) : undefined),
    expiryDate: updates.expiryDate !== undefined 
      ? updates.expiryDate 
      : (existing.expiryDate ? new Date(existing.expiryDate) : undefined),
    isPurchased: updates.isPurchased !== undefined ? updates.isPurchased : Boolean(existing.isPurchased),
    isExpiring: updates.isExpiring !== undefined ? updates.isExpiring : Boolean(existing.isExpiring)
  };

  await pool.query(
    `UPDATE grocery_items 
     SET name = ?, category = ?, quantity = ?, unit = ?, purchasedDate = ?, expiryDate = ?, isPurchased = ?, isExpiring = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.category,
      updated.quantity ?? null,
      updated.unit ?? null,
      updated.purchasedDate ? new Date(updated.purchasedDate) : null,
      updated.expiryDate ? new Date(updated.expiryDate) : null,
      updated.isPurchased ? 1 : 0,
      updated.isExpiring ? 1 : 0,
      id
    ]
  );

  return updated;
}

// ==================== PURCHASE HISTORY ====================

export async function getAllPurchaseHistory(): Promise<PurchaseHistory[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM purchase_history ORDER BY lastPurchased DESC'
  ) as [any[], any];
  
  return rows.map(row => ({
    itemName: row.itemName,
    lastPurchased: new Date(row.lastPurchased),
    frequency: row.frequency,
    category: row.category
  }));
}

export async function addOrUpdatePurchaseHistory(history: PurchaseHistory): Promise<void> {
  const pool = await getPool();
  
  await pool.query(
    `INSERT INTO purchase_history (itemName, lastPurchased, frequency, category)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       lastPurchased = VALUES(lastPurchased),
       frequency = VALUES(frequency),
       category = VALUES(category)`,
    [
      history.itemName,
      new Date(history.lastPurchased),
      history.frequency,
      history.category
    ]
  );
}

// ==================== SHOP ITEMS ====================

export interface ShopItemDB {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
  inStock: boolean;
}

export async function getAllShopItems(): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM shop_items ORDER BY name ASC'
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function getShopItemsByCategory(category: string): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE category = ? ORDER BY name ASC',
    [category]
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function searchShopItemsDB(query: string): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const searchTerm = `%${query.toLowerCase()}%`;
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE LOWER(name) LIKE ? ORDER BY name ASC',
    [searchTerm]
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function addShopItem(item: ShopItemDB): Promise<ShopItemDB> {
  const pool = await getPool();
  
  await pool.query(
    `INSERT INTO shop_items (id, name, category, defaultUnit, image, price, inStock)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.category,
      item.defaultUnit,
      item.image ?? null,
      item.price ?? null,
      item.inStock ? 1 : 0
    ]
  );

  return item;
}

export async function updateShopItem(id: string, updates: Partial<ShopItemDB>): Promise<ShopItemDB | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM shop_items WHERE id = ?', [id]) as [any[], any];
  
  if (rows.length === 0) {
    return null;
  }

  const existing = rows[0];
  const updated: ShopItemDB = {
    id: existing.id,
    name: updates.name ?? existing.name,
    category: updates.category ?? existing.category,
    defaultUnit: updates.defaultUnit ?? existing.defaultUnit,
    image: updates.image !== undefined ? updates.image : (existing.image ?? undefined),
    price: updates.price !== undefined ? updates.price : (existing.price ?? undefined),
    inStock: updates.inStock !== undefined ? updates.inStock : Boolean(existing.inStock)
  };

  await pool.query(
    `UPDATE shop_items 
     SET name = ?, category = ?, defaultUnit = ?, image = ?, price = ?, inStock = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.category,
      updated.defaultUnit,
      updated.image ?? null,
      updated.price ?? null,
      updated.inStock ? 1 : 0,
      id
    ]
  );

  return updated;
}

export async function deleteShopItem(id: string): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM shop_items WHERE id = ?', [id]) as [any, any];
  return result.affectedRows > 0;
}

export async function getCategoriesWithItemCounts(): Promise<{ category: { id: string; name: string; icon: string }; count: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT category, COUNT(*) as count 
     FROM shop_items 
     GROUP BY category`
  ) as [any[], any];

  const categoryMap = new Map(rows.map((row: any) => [row.category, row.count]));
  
  return SHOP_CATEGORIES.map(cat => ({
    category: cat,
    count: categoryMap.get(cat.id) || 0
  }));
}

export async function initializeShopData(): Promise<void> {
  const pool = await getPool();
  
  // Check if shop items already exist
  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM shop_items') as [any[], any];
  const count = countRows[0]?.count || 0;
  
  if (count === 0) {
    // Insert all shop items from shopItems.ts
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of SHOP_ITEMS) {
        await connection.query(
          `INSERT INTO shop_items (id, name, category, defaultUnit, image, price, inStock)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.name,
            item.category,
            item.defaultUnit,
            item.image ?? null,
            item.price ?? null,
            1 // inStock = true by default
          ]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

// ==================== SAMPLE DATA INITIALIZATION ====================

export async function initializeSampleData(): Promise<void> {
  // Initialize shop data
  await initializeShopData();
  
  const pool = await getPool();
  
  // Check if grocery items already exist
  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM grocery_items') as [any[], any];
  const count = countRows[0]?.count || 0;
  
  if (count === 0) {
    // Add some sample grocery items
    const sampleItems: Omit<GroceryItem, 'id'>[] = [
      {
        name: 'Milk',
        category: 'dairy',
        quantity: 1,
        unit: 'L',
        isPurchased: false
      },
      {
        name: 'Bread',
        category: 'bread',
        quantity: 1,
        unit: 'loaf',
        isPurchased: false
      },
      {
        name: 'Eggs',
        category: 'dairy',
        quantity: 12,
        unit: 'pcs',
        isPurchased: false
      }
    ];

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of sampleItems) {
        const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await connection.query(
          `INSERT INTO grocery_items (id, name, category, quantity, unit, purchasedDate, expiryDate, isPurchased, isExpiring)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.name,
            item.category,
            item.quantity ?? null,
            item.unit ?? null,
            item.purchasedDate ? new Date(item.purchasedDate) : null,
            item.expiryDate ? new Date(item.expiryDate) : null,
            item.isPurchased ? 1 : 0,
            item.isExpiring ? 1 : 0
          ]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

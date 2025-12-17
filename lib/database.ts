import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { GroceryItem, PurchaseHistory } from '@/types';

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'grocery.db');
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

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_grocery_category ON grocery_items(category);
    CREATE INDEX IF NOT EXISTS idx_grocery_purchased ON grocery_items(is_purchased);
    CREATE INDEX IF NOT EXISTS idx_history_item_name ON purchase_history(item_name);
    CREATE INDEX IF NOT EXISTS idx_history_last_purchased ON purchase_history(last_purchased);
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



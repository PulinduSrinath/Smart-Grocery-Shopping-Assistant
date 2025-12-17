import { GroceryItem, PurchaseHistory } from '@/types';
import { EXPIRY_PERIODS } from '@/lib/rules';
import {
  getAllGroceryItems,
  addGroceryItem as dbAddGroceryItem,
  deleteGroceryItem as dbRemoveGroceryItem,
  updateGroceryItem as dbUpdateGroceryItem,
  getAllPurchaseHistory,
  addOrUpdatePurchaseHistory,
  initializeSampleData as dbInitializeSampleData
} from '@/lib/database';

// Initialize database with sample data
export function initializeSampleData() {
  dbInitializeSampleData();
}

export function getGroceryList(): GroceryItem[] {
  return getAllGroceryItems();
}

export function addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem {
  return dbAddGroceryItem(item);
}

export function removeGroceryItem(id: string): boolean {
  return dbRemoveGroceryItem(id);
}

export function updateGroceryItem(id: string, updates: Partial<GroceryItem>): GroceryItem | null {
  return dbUpdateGroceryItem(id, updates);
}

export function markAsPurchased(id: string): GroceryItem | null {
  const item = getAllGroceryItems().find(i => i.id === id);
  if (item) {
    const updated = dbUpdateGroceryItem(id, {
      isPurchased: true,
      purchasedDate: new Date()
    });
    
    if (updated) {
      // Update purchase history
      addOrUpdatePurchaseHistory({
        itemName: item.name,
        lastPurchased: new Date(),
        frequency: EXPIRY_PERIODS[item.category.toLowerCase()] || 7,
        category: item.category
      });
    }
    
    return updated;
  }
  return null;
}

export function getPurchaseHistory(): PurchaseHistory[] {
  return getAllPurchaseHistory();
}

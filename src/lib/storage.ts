import { GroceryItem, PurchaseHistory } from '@/types';
import { EXPIRY_PERIODS } from '@/lib/rules';

// Use MySQL database
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
export async function initializeSampleData() {
  await dbInitializeSampleData();
}

export async function getGroceryList(): Promise<GroceryItem[]> {
  return await getAllGroceryItems();
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  return await dbAddGroceryItem(item);
}

export async function removeGroceryItem(id: string): Promise<boolean> {
  return await dbRemoveGroceryItem(id);
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
  return await dbUpdateGroceryItem(id, updates);
}

export async function markAsPurchased(id: string): Promise<GroceryItem | null> {
  const items = await getAllGroceryItems();
  const item = items.find(i => i.id === id);
  if (item) {
    const updated = await dbUpdateGroceryItem(id, {
      isPurchased: true,
      purchasedDate: new Date()
    });
    
    if (updated) {
      // Update purchase history with proper date
      await addOrUpdatePurchaseHistory({
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

export async function getPurchaseHistory(): Promise<PurchaseHistory[]> {
  return await getAllPurchaseHistory();
}

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

// Calculate expiry days based on item name
export function getExpiryDays(itemName: string, category?: string): number {
  const nameLower = itemName.toLowerCase();
  
  // Item-specific expiry periods (in days) - calculated from purchase date
  const itemExpiryDays: Record<string, number> = {
    'milk': 7, // Milk expires 7 days after purchase date
    'almond milk': 7,
    'bread': 5,
    'eggs': 21,
    'meat': 3,
    'chicken': 3,
    'fish': 2,
    'cheese': 14,
    'yogurt': 14,
    'rice': 365, // Rice expires 365 days after purchase date
    'white rice': 365,
    'brown rice': 180,
    'red rice': 180,
    'vegetables': 5,
    'fruits': 7,
    'tomato': 5,
    'onion': 30,
    'potato': 30,
    'carrot': 14,
    'lettuce': 5,
    'spinach': 3,
    'banana': 5,
    'apple': 14,
    'orange': 14,
    'grapes': 7,
    'graphs': 7, // Common misspelling
    'chocolate': 180, // Chocolate bars - 6 months
    'sugar': 730, // Sugar - 2 years (very long shelf life)
    'suger': 730, // Common misspelling
  };
  
  // Check for exact or partial match in item name
  for (const [key, days] of Object.entries(itemExpiryDays)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return days;
    }
  }
  
  // Fallback to category-based expiry
  if (category) {
    return EXPIRY_PERIODS[category.toLowerCase()] || EXPIRY_PERIODS['other'];
  }
  
  // Default expiry period
  return EXPIRY_PERIODS['other'];
}

export async function markAsPurchased(id: string): Promise<GroceryItem | null> {
  const items = await getAllGroceryItems();
  const item = items.find(i => i.id === id);
  if (item) {
    const purchaseDate = new Date();
    const expiryDays = getExpiryDays(item.name, item.category);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const updated = await dbUpdateGroceryItem(id, {
      isPurchased: true,
      purchasedDate: purchaseDate,
      expiryDate: expiryDate
    });
    
    if (updated) {
      // Update purchase history with quantity and unit
      const quantity = item.quantity || 1;
      const unit = item.unit || 'pcs';
      
      await addOrUpdatePurchaseHistory({
        itemName: item.name,
        lastPurchased: purchaseDate,
        totalQuantity: quantity,
        unit: unit,
        category: item.category || 'other'
      });
    }
    
    return updated;
  }
  return null;
}

export async function getPurchaseHistory(): Promise<PurchaseHistory[]> {
  return await getAllPurchaseHistory();
}

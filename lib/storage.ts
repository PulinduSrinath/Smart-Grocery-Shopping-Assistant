import { GroceryItem, PurchaseHistory } from '@/types';
import { EXPIRY_PERIODS } from '@/lib/rules';

// In-memory storage (in a real app, this would be a database)
let groceryList: GroceryItem[] = [];
let purchaseHistory: PurchaseHistory[] = [];

// Initialize with sample data including Sri Lankan cultural items
export function initializeSampleData() {
  if (purchaseHistory.length === 0) {
    purchaseHistory = [
      // General items
      {
        itemName: 'milk',
        lastPurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        frequency: 7,
        category: 'dairy'
      },
      {
        itemName: 'bread',
        lastPurchased: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        frequency: 5,
        category: 'bread'
      },
      {
        itemName: 'eggs',
        lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        frequency: 7,
        category: 'dairy'
      },
      {
        itemName: 'bananas',
        lastPurchased: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        frequency: 5,
        category: 'fruits'
      },
      // Sri Lankan cultural items
      {
        itemName: 'rice',
        lastPurchased: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        frequency: 7,
        category: 'other'
      },
      {
        itemName: 'coconut',
        lastPurchased: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        frequency: 5,
        category: 'other'
      },
      {
        itemName: 'curry leaves',
        lastPurchased: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'pandan leaves',
        lastPurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'dhal',
        lastPurchased: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        frequency: 7,
        category: 'vegetables'
      },
      {
        itemName: 'turmeric',
        lastPurchased: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        frequency: 14,
        category: 'vegetables'
      },
      {
        itemName: 'cinnamon',
        lastPurchased: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        frequency: 30,
        category: 'other'
      },
      {
        itemName: 'coconut oil',
        lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        frequency: 14,
        category: 'other'
      },
      {
        itemName: 'king coconut',
        lastPurchased: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        frequency: 5,
        category: 'fruits'
      },
      {
        itemName: 'gotukola',
        lastPurchased: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        frequency: 3,
        category: 'vegetables'
      }
    ];
  }
}

export function getGroceryList(): GroceryItem[] {
  return groceryList;
}

export function addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem {
  const newItem: GroceryItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random()}`
  };
  groceryList.push(newItem);
  return newItem;
}

export function removeGroceryItem(id: string): boolean {
  const index = groceryList.findIndex(item => item.id === id);
  if (index !== -1) {
    groceryList.splice(index, 1);
    return true;
  }
  return false;
}

export function updateGroceryItem(id: string, updates: Partial<GroceryItem>): GroceryItem | null {
  const index = groceryList.findIndex(item => item.id === id);
  if (index !== -1) {
    groceryList[index] = { ...groceryList[index], ...updates };
    return groceryList[index];
  }
  return null;
}

export function markAsPurchased(id: string): GroceryItem | null {
  const item = groceryList.find(i => i.id === id);
  if (item) {
    item.isPurchased = true;
    item.purchasedDate = new Date();
    
    // Update purchase history
    const historyIndex = purchaseHistory.findIndex(
      h => h.itemName.toLowerCase() === item.name.toLowerCase()
    );
    
    if (historyIndex !== -1) {
      purchaseHistory[historyIndex].lastPurchased = new Date();
    } else {
      purchaseHistory.push({
        itemName: item.name,
        lastPurchased: new Date(),
        frequency: EXPIRY_PERIODS[item.category.toLowerCase()] || 7,
        category: item.category
      });
    }
    
    return item;
  }
  return null;
}

export function getPurchaseHistory(): PurchaseHistory[] {
  return purchaseHistory;
}

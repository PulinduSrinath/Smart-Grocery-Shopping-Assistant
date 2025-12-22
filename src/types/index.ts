export interface GroceryItem {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  purchasedDate?: Date;
  expiryDate?: Date;
  isPurchased: boolean;
  isExpiring?: boolean;
}

export interface PurchaseHistory {
  itemName: string;
  lastPurchased: Date;
  totalQuantity: number; // total quantity purchased
  unit: string; // unit of measurement
  category: string;
}

export interface HealthierAlternative {
  original: string;
  alternative: string;
  reason: string;
}

export interface Suggestion {
  type: 'missing_item' | 'healthier_alternative' | 'expiring_reminder';
  message: string;
  item?: GroceryItem;
  alternative?: HealthierAlternative;
}


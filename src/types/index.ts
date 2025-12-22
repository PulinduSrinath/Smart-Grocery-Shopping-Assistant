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
  frequency: number; // days between purchases
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


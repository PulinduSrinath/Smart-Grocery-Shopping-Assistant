import { GroceryItem, PurchaseHistory, HealthierAlternative, Suggestion } from '@/types';

// Healthier alternatives mapping (including Sri Lankan foods)
export const HEALTHIER_ALTERNATIVES: Record<string, HealthierAlternative> = {
  // General items
  'white bread': {
    original: 'white bread',
    alternative: 'brown bread or whole grain bread',
    reason: 'Brown bread contains more fiber and nutrients'
  },
  'white rice': {
    original: 'white rice',
    alternative: 'red rice (rathu kekulu)',
    reason: 'Red rice have more fiber, nutrients, and lower glycemic index'
  },
  'soda': {
    original: 'soda',
    alternative: 'king coconut (thambili) or fresh fruit juice',
    reason: 'Natural hydration with electrolytes and vitamins, no added sugar'
  },
  'potato chips': {
    original: 'potato chips',
    alternative: 'roasted chickpeas or green gram (mung bean) snacks',
    reason: 'Higher protein, fiber, and lower in unhealthy fats'
  },
  'ice cream': {
    original: 'ice cream',
    alternative: 'curd (yogurt) with fruits or coconut sorbet',
    reason: 'Lower in fat, probiotics, and natural sweetness'
  },
  'butter': {
    original: 'butter',
    alternative: 'virgin coconut oil or coconut butter',
    reason: 'Medium-chain fatty acids, better for heart health'
  },
  'whole milk': {
    original: 'whole milk',
    alternative: 'coconut milk or low-fat curd',
    reason: 'Lower in saturated fat, plant-based option available'
  },
  'sugar': {
    original: 'sugar',
    alternative: 'kithul jaggery (kithul hakuru) or palm jaggery',
    reason: 'Natural sweetener with minerals, lower glycemic index'
  },
  'refined flour': {
    original: 'refined flour',
    alternative: 'kurakkan flour (finger millet) or whole wheat flour',
    reason: 'Higher fiber, protein, and essential minerals like iron and calcium'
  },
  // Sri Lankan specific items
  'white rice samba': {
    original: 'white rice samba',
    alternative: 'red rice or nadu rice',
    reason: 'More fiber and nutrients, better for blood sugar control'
  },
  'coconut oil': {
    original: 'coconut oil',
    alternative: 'virgin coconut oil (unrefined)',
    reason: 'Less processed, retains more antioxidants and nutrients'
  },
  'pol sambol': {
    original: 'pol sambol',
    alternative: 'pol sambol with less coconut and more lime',
    reason: 'Lower calories while maintaining flavor'
  },
  'string hoppers': {
    original: 'string hoppers',
    alternative: 'string hoppers with red rice flour',
    reason: 'More fiber and nutrients'
  },
  'hoppers': {
    original: 'hoppers',
    alternative: 'hoppers with kurakkan flour or whole wheat',
    reason: 'Higher nutritional value and fiber content'
  },
  'roti': {
    original: 'roti',
    alternative: 'pol roti with kurakkan flour',
    reason: 'More fiber, protein, and essential minerals'
  },
  'dhal': {
    original: 'dhal',
    alternative: 'whole dhal (with skin) or green gram',
    reason: 'More fiber, protein, and nutrients'
  },
  'curry powder': {
    original: 'curry powder',
    alternative: 'fresh curry leaves, turmeric, and spices',
    reason: 'More antioxidants and anti-inflammatory properties'
  },
  'coconut milk': {
    original: 'coconut milk',
    alternative: 'light coconut milk or fresh coconut milk',
    reason: 'Lower fat content while maintaining flavor'
  },
  'gotukola': {
    original: 'gotukola',
    alternative: 'fresh gotukola or mukunuwenna',
    reason: 'Rich in vitamins and minerals, great for brain health'
  },
  'pandan leaves': {
    original: 'pandan leaves',
    alternative: 'fresh pandan leaves (rampe)',
    reason: 'Natural flavoring with antioxidant properties'
  },
  'turmeric': {
    original: 'turmeric',
    alternative: 'fresh turmeric root',
    reason: 'Higher curcumin content, better anti-inflammatory benefits'
  },
  'cinnamon': {
    original: 'cinnamon',
    alternative: 'ceylon cinnamon (true cinnamon)',
    reason: 'Lower coumarin content, better for regular consumption'
  },
  'king coconut': {
    original: 'king coconut',
    alternative: 'fresh king coconut (thambili)',
    reason: 'Natural electrolytes, vitamins, and hydration'
  },
  'jaggery': {
    original: 'jaggery',
    alternative: 'kithul jaggery (kithul hakuru)',
    reason: 'More minerals and lower glycemic index than regular jaggery'
  }
};

// Sri Lankan cultural food suggestions
export const SRI_LANKAN_ESSENTIALS = [
  { name: 'rice', category: 'other', frequency: 7, description: 'Staple food - consider red rice' },
  { name: 'coconut', category: 'other', frequency: 5, description: 'Essential for curries and sambols' },
  { name: 'curry leaves', category: 'vegetables', frequency: 7, description: 'Aromatic leaves for curries' },
  { name: 'pandan leaves', category: 'vegetables', frequency: 7, description: 'Rampe - for flavoring rice and curries' },
  { name: 'turmeric', category: 'vegetables', frequency: 14, description: 'Essential spice with health benefits' },
  { name: 'cinnamon', category: 'other', frequency: 30, description: 'Ceylon cinnamon - world famous spice' },
  { name: 'cardamom', category: 'other', frequency: 30, description: 'Aromatic spice for curries and tea' },
  { name: 'dhal', category: 'vegetables', frequency: 7, description: 'Lentils - protein-rich staple' },
  { name: 'green gram', category: 'vegetables', frequency: 7, description: 'Mung beans - healthy protein source' },
  { name: 'gotukola', category: 'vegetables', frequency: 3, description: 'Centella - brain-boosting green leafy vegetable' },
  { name: 'mukunuwenna', category: 'vegetables', frequency: 3, description: 'Alternanthera - nutritious leafy green' },
  { name: 'king coconut', category: 'fruits', frequency: 5, description: 'Thambili - natural hydrating drink' },
  { name: 'coconut oil', category: 'other', frequency: 14, description: 'Cooking oil - prefer virgin coconut oil' },
  { name: 'kithul jaggery', category: 'other', frequency: 14, description: 'Natural sweetener - healthier than sugar' },
  { name: 'kurakkan flour', category: 'other', frequency: 14, description: 'Finger millet flour - high in iron and calcium' }
];

// Typical expiry periods in days for different categories
export const EXPIRY_PERIODS: Record<string, number> = {
  'dairy': 7,
  'meat': 3,
  'vegetables': 5,
  'fruits': 7,
  'bread': 5,
  'beverages': 30,
  'snacks': 60,
  'other': 14
};

// Rule-based reasoning for missing items (including Sri Lankan cultural suggestions)
export function predictMissingItems(
  currentList: GroceryItem[],
  purchaseHistory: PurchaseHistory[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const currentItemNames = currentList.map(item => item.name.toLowerCase());

  // Check purchase history for items that should be repurchased
  const now = new Date();
  purchaseHistory.forEach(history => {
    const daysSinceLastPurchase = Math.floor(
      (now.getTime() - new Date(history.lastPurchased).getTime()) / (1000 * 60 * 60 * 24)
    );

    // If item is not in current list and was purchased more than 7 days ago
    // Suggest based on purchase history (default threshold: 7 days)
    if (!currentItemNames.includes(history.itemName.toLowerCase()) && 
        daysSinceLastPurchase >= 7) {
      suggestions.push({
        type: 'missing_item',
        message: `You bought ${history.itemName} (${history.totalQuantity} ${history.unit}) ${daysSinceLastPurchase} days ago. Should I add it again?`,
        item: {
          id: `suggested-${Date.now()}-${Math.random()}`,
          name: history.itemName,
          category: history.category,
          quantity: history.totalQuantity,
          unit: history.unit,
          isPurchased: false
        }
      });
    }
  });

  // Suggest Sri Lankan cultural essentials if not in list
  SRI_LANKAN_ESSENTIALS.forEach(essential => {
    const isInList = currentItemNames.some(name => 
      name.includes(essential.name.toLowerCase()) || 
      essential.name.toLowerCase().includes(name)
    );
    
    if (!isInList) {
      // Suggest based on frequency - if it's a common item
      if (essential.frequency <= 7) {
        suggestions.push({
          type: 'missing_item',
          message: `🇱🇰 Sri Lankan essential: ${essential.name} - ${essential.description}. Should I add it?`,
          item: {
            id: `suggested-sri-lankan-${Date.now()}-${Math.random()}`,
            name: essential.name,
            category: essential.category,
            isPurchased: false
          }
        });
      }
    }
  });

  return suggestions;
}

// Suggest healthier alternatives (including Sri Lankan options)
export function suggestHealthierAlternatives(
  currentList: GroceryItem[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  currentList.forEach(item => {
    const itemNameLower = item.name.toLowerCase();
    
    // Check exact match first
    let alternative = HEALTHIER_ALTERNATIVES[itemNameLower];
    
    // Check partial matches for Sri Lankan items
    if (!alternative) {
      for (const [key, value] of Object.entries(HEALTHIER_ALTERNATIVES)) {
        if (itemNameLower.includes(key) || key.includes(itemNameLower)) {
          alternative = value;
          break;
        }
      }
    }

    if (alternative && !item.isPurchased) {
      suggestions.push({
        type: 'healthier_alternative',
        message: `🥗 Healthier option: Consider ${alternative.alternative} instead of ${alternative.original}. ${alternative.reason}.`,
        alternative: alternative,
        item: item
      });
    }
  });

  return suggestions;
}

// Check for expiring items
export function checkExpiringItems(
  currentList: GroceryItem[],
  purchaseHistory: PurchaseHistory[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = new Date();

  currentList.forEach(item => {
    if (item.purchasedDate && !item.isPurchased) {
      const daysSincePurchase = Math.floor(
        (now.getTime() - new Date(item.purchasedDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get expiry period for this category
      const expiryPeriod = EXPIRY_PERIODS[item.category.toLowerCase()] || EXPIRY_PERIODS['other'];
      const daysUntilExpiry = expiryPeriod - daysSincePurchase;

      if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
        suggestions.push({
          type: 'expiring_reminder',
          message: `⚠️ ${item.name} will expire in ${daysUntilExpiry} day(s). Consider using it soon!`,
          item: { ...item, isExpiring: true }
        });
      } else if (daysUntilExpiry <= 0) {
        suggestions.push({
          type: 'expiring_reminder',
          message: `🚨 ${item.name} may have expired! Please check before consuming.`,
          item: { ...item, isExpiring: true }
        });
      }
    } else if (!item.purchasedDate) {
      // If no purchase date, estimate based on history
      const history = purchaseHistory.find(h => 
        h.itemName.toLowerCase() === item.name.toLowerCase()
      );
      
      if (history) {
        const estimatedExpiry = new Date(history.lastPurchased);
        estimatedExpiry.setDate(estimatedExpiry.getDate() + (EXPIRY_PERIODS[item.category.toLowerCase()] || EXPIRY_PERIODS['other']));
        
        const daysUntilExpiry = Math.floor(
          (estimatedExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          suggestions.push({
            type: 'expiring_reminder',
            message: `⚠️ ${item.name} may expire soon (estimated ${daysUntilExpiry} day(s)). Check your inventory!`,
            item: { ...item, isExpiring: true }
          });
        }
      }
    }
  });

  return suggestions;
}

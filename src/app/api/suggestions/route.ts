import { NextResponse } from 'next/server';
import { getGroceryList, getPurchaseHistory, initializeSampleData } from '@/lib/storage';
import { 
  predictMissingItems, 
  suggestHealthierAlternatives, 
  checkExpiringItems 
} from '@/lib/rules';

// Initialize sample data
initializeSampleData();

export async function GET() {
  try {
    const groceryList = getGroceryList();
    const purchaseHistory = getPurchaseHistory();

    const missingItems = predictMissingItems(groceryList, purchaseHistory);
    const healthierAlternatives = suggestHealthierAlternatives(groceryList);
    const expiringItems = checkExpiringItems(groceryList, purchaseHistory);

    const allSuggestions = [
      ...missingItems,
      ...healthierAlternatives,
      ...expiringItems
    ];

    return NextResponse.json({ 
      suggestions: allSuggestions,
      counts: {
        missing: missingItems.length,
        healthier: healthierAlternatives.length,
        expiring: expiringItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

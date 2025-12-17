import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllShopItems, 
  getShopItemsByCategory, 
  searchShopItemsDB,
  addShopItem,
  updateShopItem,
  deleteShopItem,
  getCategoriesWithItemCounts,
  initializeShopData,
  ShopItemDB
} from '@/lib/database';

// Initialize shop data on first request
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    initializeShopData();
    initialized = true;
  }
}

// GET - Fetch shop items with optional filters
export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeCategories = searchParams.get('includeCategories') === 'true';

    let items: ShopItemDB[];

    if (search) {
      // Search by name
      items = searchShopItemsDB(search);
    } else if (category && category !== 'all') {
      // Filter by category
      items = getShopItemsByCategory(category);
    } else {
      // Get all items
      items = getAllShopItems();
    }

    // Include categories if requested
    if (includeCategories) {
      const categoriesWithCounts = getCategoriesWithItemCounts();
      return NextResponse.json({
        items,
        categories: categoriesWithCounts
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 }
    );
  }
}

// POST - Add a new shop item
export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { name, category, defaultUnit, image, price, inStock = true } = body;

    if (!name || !category || !defaultUnit) {
      return NextResponse.json(
        { error: 'Name, category, and defaultUnit are required' },
        { status: 400 }
      );
    }

    const id = `shop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem = addShopItem({
      id,
      name,
      category,
      defaultUnit,
      image,
      price,
      inStock
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding shop item:', error);
    return NextResponse.json(
      { error: 'Failed to add shop item' },
      { status: 500 }
    );
  }
}

// PUT - Update a shop item
export async function PUT(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const updatedItem = updateShopItem(id, updates);

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating shop item:', error);
    return NextResponse.json(
      { error: 'Failed to update shop item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a shop item
export async function DELETE(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const deleted = deleteShopItem(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop item' },
      { status: 500 }
    );
  }
}

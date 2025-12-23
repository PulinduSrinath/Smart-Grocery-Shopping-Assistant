import { NextRequest, NextResponse } from 'next/server';
import { 
  getGroceryList, 
  addGroceryItem, 
  removeGroceryItem, 
  updateGroceryItem,
  initializeSampleData,
  getExpiryDays
} from '@/lib/storage';
import { GroceryItem } from '@/types';

// Initialize sample data on first load (fire and forget)
let initialized = false;
if (!initialized) {
  initializeSampleData().catch(console.error);
  initialized = true;
}

// READ - Get all items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, get single item
    if (id) {
      const list = await getGroceryList();
      const item = list.find(item => item.id === id);
      
      if (!item) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ item });
    }
    
    // Otherwise, get all items
    const list = await getGroceryList();
    return NextResponse.json({ 
      list,
      count: list.length 
    });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    );
  }
}

// CREATE - Add new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, quantity, unit, purchasedDate, expiryDate } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Item name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate dates if provided
    let parsedPurchasedDate: Date | undefined;
    let parsedExpiryDate: Date | undefined;

    if (purchasedDate) {
      parsedPurchasedDate = new Date(purchasedDate);
      if (isNaN(parsedPurchasedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid purchased date format' },
          { status: 400 }
        );
      }
    }

    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (isNaN(parsedExpiryDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiry date format' },
          { status: 400 }
        );
      }
    } else if (parsedPurchasedDate) {
      // Auto-calculate expiry date ONLY if purchase date is provided
      // Expiry date = Purchase date + expiry days (e.g., milk: purchase date + 7 days, rice: purchase date + 365 days)
      const expiryDays = getExpiryDays(name.trim(), category ? category.toLowerCase() : undefined);
      parsedExpiryDate = new Date(parsedPurchasedDate);
      parsedExpiryDate.setDate(parsedExpiryDate.getDate() + expiryDays);
    }
    // If no purchase date and no expiry date provided, expiryDate remains undefined

    const newItem = await addGroceryItem({
      name: name.trim(),
      category: category ? category.toLowerCase() : undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: unit || undefined,
      purchasedDate: parsedPurchasedDate,
      expiryDate: parsedExpiryDate,
      isPurchased: false
    });

    return NextResponse.json({ 
      item: newItem,
      message: 'Item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE - Remove item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const success = await removeGroceryItem(id);
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Item deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

// UPDATE - Update existing item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, quantity, unit, purchasedDate, expiryDate, isPurchased, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Build updates object
    const updates: Partial<GroceryItem> = { ...otherUpdates };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Item name must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (category !== undefined) {
      updates.category = category ? category.toLowerCase() : undefined;
    }

    if (quantity !== undefined) {
      if (quantity === null || quantity === '') {
        updates.quantity = undefined;
        updates.unit = undefined;
      } else {
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty < 0) {
          return NextResponse.json(
            { error: 'Quantity must be a positive number' },
            { status: 400 }
          );
        }
        updates.quantity = qty;
        updates.unit = unit || 'pcs';
      }
    }

    // Get current item for expiry calculation if needed
    const currentList = await getGroceryList();
    const currentItem = currentList.find(item => item.id === id);
    
    if (expiryDate !== undefined) {
      if (expiryDate === null) {
        updates.expiryDate = undefined;
      } else {
        const parsedDate = new Date(expiryDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid expiry date format' },
            { status: 400 }
          );
        }
        updates.expiryDate = parsedDate;
      }
    }

    // Handle purchase date and auto-calculate expiry if needed
    if (purchasedDate !== undefined) {
      if (purchasedDate === null) {
        updates.purchasedDate = undefined;
      } else {
        const parsedPurchaseDate = new Date(purchasedDate);
        if (isNaN(parsedPurchaseDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid purchased date format' },
            { status: 400 }
          );
        }
        updates.purchasedDate = parsedPurchaseDate;
        
        // Auto-calculate expiry date if not explicitly provided
        if (expiryDate === undefined && currentItem) {
          const itemName = updates.name || currentItem.name;
          const itemCategory = updates.category !== undefined ? updates.category : currentItem.category;
          const expiryDays = getExpiryDays(itemName, itemCategory);
          const calculatedExpiryDate = new Date(parsedPurchaseDate);
          calculatedExpiryDate.setDate(calculatedExpiryDate.getDate() + expiryDays);
          updates.expiryDate = calculatedExpiryDate;
        }
      }
    }

    if (isPurchased !== undefined) {
      if (typeof isPurchased !== 'boolean') {
        return NextResponse.json(
          { error: 'isPurchased must be a boolean' },
          { status: 400 }
        );
      }
      updates.isPurchased = isPurchased;
      
      // If marking as purchased, set purchase date to today if not provided, and calculate expiry
      if (isPurchased && currentItem) {
        if (!updates.purchasedDate && !currentItem.purchasedDate) {
          updates.purchasedDate = new Date();
        }
        
        const purchaseDate = updates.purchasedDate || currentItem.purchasedDate;
        if (purchaseDate && !updates.expiryDate) {
          const itemName = updates.name || currentItem.name;
          const itemCategory = updates.category !== undefined ? updates.category : currentItem.category;
          const expiryDays = getExpiryDays(itemName, itemCategory);
          const calculatedExpiryDate = new Date(purchaseDate);
          calculatedExpiryDate.setDate(calculatedExpiryDate.getDate() + expiryDays);
          updates.expiryDate = calculatedExpiryDate;
        }
      }
    }
    
    // If name or category changes and item has purchase date, recalculate expiry
    if ((updates.name !== undefined || updates.category !== undefined) && currentItem) {
      const purchaseDate = updates.purchasedDate || currentItem.purchasedDate;
      if (purchaseDate && expiryDate === undefined && !updates.expiryDate) {
        const itemName = updates.name || currentItem.name;
        const itemCategory = updates.category !== undefined ? updates.category : currentItem.category;
        const expiryDays = getExpiryDays(itemName, itemCategory);
        const calculatedExpiryDate = new Date(purchaseDate);
        calculatedExpiryDate.setDate(calculatedExpiryDate.getDate() + expiryDays);
        updates.expiryDate = calculatedExpiryDate;
      }
    }

    const updatedItem = await updateGroceryItem(id, updates);
    if (updatedItem) {
      return NextResponse.json({ 
        item: updatedItem,
        message: 'Item updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}


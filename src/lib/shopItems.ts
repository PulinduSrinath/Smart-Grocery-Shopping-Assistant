// Shop Catalog - All available grocery items organized by category

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
}

export const SHOP_CATEGORIES = [
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'bread', name: 'Bread & Bakery', icon: '🍞' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'grains', name: 'Rice & Grains', icon: '🌾' },
  { id: 'spices', name: 'Spices & Seasonings', icon: '🧂' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'canned', name: 'Canned Goods', icon: '🥫' },
  { id: 'household', name: 'Household', icon: '🧹' },
  { id: 'personal', name: 'Personal Care', icon: '🧴' },
  { id: 'other', name: 'Other', icon: '📦' },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Dairy & Eggs
  { id: 'dairy-1', name: 'Milk', category: 'dairy', defaultUnit: 'L' },
  { id: 'dairy-2', name: 'Eggs', category: 'dairy', defaultUnit: 'pcs' },
  { id: 'dairy-3', name: 'Butter', category: 'dairy', defaultUnit: 'g' },
  { id: 'dairy-4', name: 'Cheese', category: 'dairy', defaultUnit: 'g' },
  { id: 'dairy-5', name: 'Yogurt', category: 'dairy', defaultUnit: 'pcs' },
  { id: 'dairy-6', name: 'Curd', category: 'dairy', defaultUnit: 'g' },
  { id: 'dairy-7', name: 'Cream', category: 'dairy', defaultUnit: 'mL' },
  { id: 'dairy-8', name: 'Ghee', category: 'dairy', defaultUnit: 'g' },
  { id: 'dairy-9', name: 'Condensed Milk', category: 'dairy', defaultUnit: 'g' },
  { id: 'dairy-10', name: 'Paneer', category: 'dairy', defaultUnit: 'g' },

  // Meat & Seafood
  { id: 'meat-1', name: 'Chicken Breast', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-2', name: 'Chicken Whole', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-3', name: 'Beef', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-4', name: 'Mutton', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-5', name: 'Fish', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-6', name: 'Prawns', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-7', name: 'Crab', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-8', name: 'Salmon', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-9', name: 'Tuna', category: 'meat', defaultUnit: 'kg' },
  { id: 'meat-10', name: 'Sausages', category: 'meat', defaultUnit: 'pack' },

  // Vegetables
  { id: 'veg-1', name: 'Tomatoes', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-2', name: 'Onions', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-3', name: 'Potatoes', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-4', name: 'Carrots', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-5', name: 'Cabbage', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-6', name: 'Spinach', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-7', name: 'Broccoli', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-8', name: 'Cauliflower', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-9', name: 'Green Beans', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-10', name: 'Peas', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-11', name: 'Cucumber', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-12', name: 'Bell Peppers', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-13', name: 'Garlic', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-14', name: 'Ginger', category: 'vegetables', defaultUnit: 'g' },
  { id: 'veg-15', name: 'Green Chili', category: 'vegetables', defaultUnit: 'g' },
  { id: 'veg-16', name: 'Curry Leaves', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-17', name: 'Coriander Leaves', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-18', name: 'Mint Leaves', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-19', name: 'Leeks', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-20', name: 'Pumpkin', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-21', name: 'Bitter Gourd', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-22', name: 'Eggplant', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-23', name: 'Okra (Ladies Finger)', category: 'vegetables', defaultUnit: 'kg' },
  { id: 'veg-24', name: 'Drumstick', category: 'vegetables', defaultUnit: 'pcs' },
  { id: 'veg-25', name: 'Gotukola', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-26', name: 'Mukunuwenna', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-27', name: 'Pandan Leaves', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-28', name: 'Lemongrass', category: 'vegetables', defaultUnit: 'bunch' },
  { id: 'veg-29', name: 'Mushrooms', category: 'vegetables', defaultUnit: 'pack' },
  { id: 'veg-30', name: 'Lettuce', category: 'vegetables', defaultUnit: 'pcs' },

  // Fruits
  { id: 'fruit-1', name: 'Apples', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-2', name: 'Bananas', category: 'fruits', defaultUnit: 'bunch' },
  { id: 'fruit-3', name: 'Oranges', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-4', name: 'Grapes', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-5', name: 'Mangoes', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-6', name: 'Pineapple', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-7', name: 'Papaya', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-8', name: 'Watermelon', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-9', name: 'Strawberries', category: 'fruits', defaultUnit: 'pack' },
  { id: 'fruit-10', name: 'Avocado', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-11', name: 'Coconut', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-12', name: 'King Coconut', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-13', name: 'Lime', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-14', name: 'Lemon', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-15', name: 'Pomegranate', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-16', name: 'Guava', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-17', name: 'Passion Fruit', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-18', name: 'Dragon Fruit', category: 'fruits', defaultUnit: 'pcs' },
  { id: 'fruit-19', name: 'Rambutan', category: 'fruits', defaultUnit: 'kg' },
  { id: 'fruit-20', name: 'Wood Apple', category: 'fruits', defaultUnit: 'pcs' },

  // Bread & Bakery
  { id: 'bread-1', name: 'White Bread', category: 'bread', defaultUnit: 'loaf' },
  { id: 'bread-2', name: 'Brown Bread', category: 'bread', defaultUnit: 'loaf' },
  { id: 'bread-3', name: 'Whole Wheat Bread', category: 'bread', defaultUnit: 'loaf' },
  { id: 'bread-4', name: 'Roti', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-5', name: 'Naan', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-6', name: 'Pita Bread', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-7', name: 'Croissants', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-8', name: 'Burger Buns', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-9', name: 'Hot Dog Buns', category: 'bread', defaultUnit: 'pack' },
  { id: 'bread-10', name: 'Cake', category: 'bread', defaultUnit: 'pcs' },

  // Beverages
  { id: 'bev-1', name: 'Mineral Water', category: 'beverages', defaultUnit: 'bottle' },
  { id: 'bev-2', name: 'Orange Juice', category: 'beverages', defaultUnit: 'L' },
  { id: 'bev-3', name: 'Apple Juice', category: 'beverages', defaultUnit: 'L' },
  { id: 'bev-4', name: 'Mango Juice', category: 'beverages', defaultUnit: 'L' },
  { id: 'bev-5', name: 'Coca Cola', category: 'beverages', defaultUnit: 'bottle' },
  { id: 'bev-6', name: 'Pepsi', category: 'beverages', defaultUnit: 'bottle' },
  { id: 'bev-7', name: 'Sprite', category: 'beverages', defaultUnit: 'bottle' },
  { id: 'bev-8', name: 'Tea', category: 'beverages', defaultUnit: 'pack' },
  { id: 'bev-9', name: 'Coffee', category: 'beverages', defaultUnit: 'pack' },
  { id: 'bev-10', name: 'Green Tea', category: 'beverages', defaultUnit: 'pack' },
  { id: 'bev-11', name: 'Energy Drink', category: 'beverages', defaultUnit: 'can' },
  { id: 'bev-12', name: 'Coconut Water', category: 'beverages', defaultUnit: 'bottle' },

  // Snacks
  { id: 'snack-1', name: 'Potato Chips', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-2', name: 'Biscuits', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-3', name: 'Cookies', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-4', name: 'Chocolate', category: 'snacks', defaultUnit: 'pcs' },
  { id: 'snack-5', name: 'Nuts (Mixed)', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-6', name: 'Cashew Nuts', category: 'snacks', defaultUnit: 'g' },
  { id: 'snack-7', name: 'Peanuts', category: 'snacks', defaultUnit: 'g' },
  { id: 'snack-8', name: 'Popcorn', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-9', name: 'Crackers', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-10', name: 'Murukku', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-11', name: 'Kavum', category: 'snacks', defaultUnit: 'pack' },
  { id: 'snack-12', name: 'Kokis', category: 'snacks', defaultUnit: 'pack' },

  // Rice & Grains
  { id: 'grain-1', name: 'White Rice', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-2', name: 'Red Rice', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-3', name: 'Basmati Rice', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-4', name: 'Samba Rice', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-5', name: 'Brown Rice', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-6', name: 'Dhal (Red Lentils)', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-7', name: 'Green Gram', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-8', name: 'Chickpeas', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-9', name: 'Black Gram', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-10', name: 'Oats', category: 'grains', defaultUnit: 'pack' },
  { id: 'grain-11', name: 'Wheat Flour', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-12', name: 'Rice Flour', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-13', name: 'Kurakkan Flour', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-14', name: 'Pasta', category: 'grains', defaultUnit: 'pack' },
  { id: 'grain-15', name: 'Noodles', category: 'grains', defaultUnit: 'pack' },
  { id: 'grain-16', name: 'Macaroni', category: 'grains', defaultUnit: 'pack' },
  { id: 'grain-17', name: 'Vermicelli', category: 'grains', defaultUnit: 'pack' },
  { id: 'grain-18', name: 'Semolina', category: 'grains', defaultUnit: 'kg' },
  { id: 'grain-19', name: 'Cornflour', category: 'grains', defaultUnit: 'g' },
  { id: 'grain-20', name: 'Quinoa', category: 'grains', defaultUnit: 'pack' },

  // Spices & Seasonings
  { id: 'spice-1', name: 'Salt', category: 'spices', defaultUnit: 'pack' },
  { id: 'spice-2', name: 'Black Pepper', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-3', name: 'Turmeric Powder', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-4', name: 'Chili Powder', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-5', name: 'Curry Powder', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-6', name: 'Cumin', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-7', name: 'Coriander Powder', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-8', name: 'Cinnamon', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-9', name: 'Cardamom', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-10', name: 'Cloves', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-11', name: 'Mustard Seeds', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-12', name: 'Fenugreek', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-13', name: 'Fennel Seeds', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-14', name: 'Garam Masala', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-15', name: 'Soy Sauce', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-16', name: 'Vinegar', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-17', name: 'Tomato Sauce', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-18', name: 'Chili Sauce', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-19', name: 'Coconut Oil', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-20', name: 'Vegetable Oil', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-21', name: 'Olive Oil', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-22', name: 'Sugar', category: 'spices', defaultUnit: 'kg' },
  { id: 'spice-23', name: 'Jaggery', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-24', name: 'Honey', category: 'spices', defaultUnit: 'bottle' },
  { id: 'spice-25', name: 'Tamarind', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-26', name: 'Goraka', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-27', name: 'Maldive Fish', category: 'spices', defaultUnit: 'g' },
  { id: 'spice-28', name: 'Coconut Milk', category: 'spices', defaultUnit: 'can' },
  { id: 'spice-29', name: 'Coconut Cream', category: 'spices', defaultUnit: 'can' },
  { id: 'spice-30', name: 'Mayonnaise', category: 'spices', defaultUnit: 'bottle' },

  // Frozen Foods
  { id: 'frozen-1', name: 'Frozen Vegetables', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-2', name: 'Frozen Fish', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-3', name: 'Frozen Prawns', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-4', name: 'Ice Cream', category: 'frozen', defaultUnit: 'tub' },
  { id: 'frozen-5', name: 'Frozen Pizza', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-6', name: 'Frozen Fries', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-7', name: 'Frozen Chicken Nuggets', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-8', name: 'Frozen Samosa', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-9', name: 'Frozen Paratha', category: 'frozen', defaultUnit: 'pack' },
  { id: 'frozen-10', name: 'Ice Cubes', category: 'frozen', defaultUnit: 'pack' },

  // Canned Goods
  { id: 'can-1', name: 'Canned Tuna', category: 'canned', defaultUnit: 'can' },
  { id: 'can-2', name: 'Canned Sardines', category: 'canned', defaultUnit: 'can' },
  { id: 'can-3', name: 'Canned Beans', category: 'canned', defaultUnit: 'can' },
  { id: 'can-4', name: 'Canned Corn', category: 'canned', defaultUnit: 'can' },
  { id: 'can-5', name: 'Canned Tomatoes', category: 'canned', defaultUnit: 'can' },
  { id: 'can-6', name: 'Canned Mushrooms', category: 'canned', defaultUnit: 'can' },
  { id: 'can-7', name: 'Canned Pineapple', category: 'canned', defaultUnit: 'can' },
  { id: 'can-8', name: 'Canned Peaches', category: 'canned', defaultUnit: 'can' },
  { id: 'can-9', name: 'Condensed Soup', category: 'canned', defaultUnit: 'can' },
  { id: 'can-10', name: 'Baked Beans', category: 'canned', defaultUnit: 'can' },

  // Household
  { id: 'house-1', name: 'Dish Soap', category: 'household', defaultUnit: 'bottle' },
  { id: 'house-2', name: 'Laundry Detergent', category: 'household', defaultUnit: 'pack' },
  { id: 'house-3', name: 'Fabric Softener', category: 'household', defaultUnit: 'bottle' },
  { id: 'house-4', name: 'Floor Cleaner', category: 'household', defaultUnit: 'bottle' },
  { id: 'house-5', name: 'Glass Cleaner', category: 'household', defaultUnit: 'bottle' },
  { id: 'house-6', name: 'Toilet Cleaner', category: 'household', defaultUnit: 'bottle' },
  { id: 'house-7', name: 'Sponges', category: 'household', defaultUnit: 'pack' },
  { id: 'house-8', name: 'Trash Bags', category: 'household', defaultUnit: 'pack' },
  { id: 'house-9', name: 'Paper Towels', category: 'household', defaultUnit: 'pack' },
  { id: 'house-10', name: 'Toilet Paper', category: 'household', defaultUnit: 'pack' },
  { id: 'house-11', name: 'Tissues', category: 'household', defaultUnit: 'box' },
  { id: 'house-12', name: 'Aluminum Foil', category: 'household', defaultUnit: 'roll' },
  { id: 'house-13', name: 'Plastic Wrap', category: 'household', defaultUnit: 'roll' },
  { id: 'house-14', name: 'Matches', category: 'household', defaultUnit: 'box' },
  { id: 'house-15', name: 'Candles', category: 'household', defaultUnit: 'pack' },

  // Personal Care
  { id: 'personal-1', name: 'Toothpaste', category: 'personal', defaultUnit: 'tube' },
  { id: 'personal-2', name: 'Toothbrush', category: 'personal', defaultUnit: 'pcs' },
  { id: 'personal-3', name: 'Shampoo', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-4', name: 'Conditioner', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-5', name: 'Body Wash', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-6', name: 'Soap', category: 'personal', defaultUnit: 'pcs' },
  { id: 'personal-7', name: 'Deodorant', category: 'personal', defaultUnit: 'pcs' },
  { id: 'personal-8', name: 'Face Wash', category: 'personal', defaultUnit: 'tube' },
  { id: 'personal-9', name: 'Moisturizer', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-10', name: 'Sunscreen', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-11', name: 'Razor', category: 'personal', defaultUnit: 'pack' },
  { id: 'personal-12', name: 'Shaving Cream', category: 'personal', defaultUnit: 'can' },
  { id: 'personal-13', name: 'Hand Sanitizer', category: 'personal', defaultUnit: 'bottle' },
  { id: 'personal-14', name: 'Cotton Buds', category: 'personal', defaultUnit: 'pack' },
  { id: 'personal-15', name: 'Band-Aids', category: 'personal', defaultUnit: 'box' },
];

// Get items by category
export function getItemsByCategory(category: string): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category);
}

// Search items
export function searchShopItems(query: string): ShopItem[] {
  const lowerQuery = query.toLowerCase();
  return SHOP_ITEMS.filter(item => 
    item.name.toLowerCase().includes(lowerQuery)
  );
}

// Get all categories with item counts
export function getCategoriesWithCounts(): { category: typeof SHOP_CATEGORIES[0]; count: number }[] {
  return SHOP_CATEGORIES.map(cat => ({
    category: cat,
    count: SHOP_ITEMS.filter(item => item.category === cat.id).length
  }));
}


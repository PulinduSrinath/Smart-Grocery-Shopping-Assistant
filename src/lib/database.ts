import mysql from 'mysql2/promise';
import { GroceryItem, PurchaseHistory } from '@/types';

// Shop Categories
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

// Shop Items - Initial seed data
type ShopItemSeed = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
};

const SHOP_ITEMS: ShopItemSeed[] = [
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

// MySQL connection configuration
const dbName = process.env.DB_NAME || 'grocery_db';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
let pool: mysql.Pool | null = null;
let tablesInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Ensure database exists and is initialized
async function ensureDatabaseInitialized(): Promise<void> {
  if (tablesInitialized) return;
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    // First, connect without database to create it
    const tempConfig: any = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 1
    };
    
    const tempPool = mysql.createPool(tempConfig);
    const tempConnection = await tempPool.getConnection();
    
    try {
      // Create database if it doesn't exist
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    } finally {
      tempConnection.release();
      await tempPool.end();
    }
    
    // Now create the main pool with the database
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    
    // Create tables
    const connection = await pool.getConnection();
    
    try {

    // Grocery items table with proper date handling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NULL,
        quantity DECIMAL(10, 2),
        unit VARCHAR(50),
        purchasedDate DATETIME NULL,
        expiryDate DATETIME NULL,
        isPurchased BOOLEAN NOT NULL DEFAULT FALSE,
        isExpiring BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_isPurchased (isPurchased)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Alter existing table to allow NULL category if it exists
    try {
      await connection.query(`
        ALTER TABLE grocery_items 
        MODIFY COLUMN category VARCHAR(100) NULL
      `);
    } catch (error: any) {
      // Ignore error if column doesn't exist or is already nullable
      if (error.code !== 'ER_BAD_FIELD_ERROR' && error.code !== 'ER_DUP_FIELDNAME') {
        console.log('Note: Category column may already be nullable or table may not exist yet');
      }
    }

    // Purchase history table with proper date handling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_history (
        itemName VARCHAR(255) PRIMARY KEY,
        lastPurchased DATETIME NOT NULL,
        totalQuantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
        category VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_lastPurchased (lastPurchased)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Migrate existing frequency column to totalQuantity and unit if needed
    try {
      // Check if totalQuantity column exists
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'purchase_history' 
        AND COLUMN_NAME = 'totalQuantity'
      `) as [any[], any];
      
      if (columns.length === 0) {
        // Add new columns
        await connection.query(`
          ALTER TABLE purchase_history 
          ADD COLUMN totalQuantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
          ADD COLUMN unit VARCHAR(50) NOT NULL DEFAULT 'pcs'
        `);
        
        // Migrate existing frequency data if it exists
        try {
          const [hasFrequency] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'purchase_history' 
            AND COLUMN_NAME = 'frequency'
          `) as [any[], any];
          
          if (hasFrequency.length > 0) {
            // Set default quantity for existing records
            await connection.query(`
              UPDATE purchase_history 
              SET totalQuantity = 1, unit = 'pcs'
              WHERE totalQuantity = 0
            `);
            
            // Remove frequency column
            await connection.query(`
              ALTER TABLE purchase_history 
              DROP COLUMN frequency
            `);
          }
        } catch (error: any) {
          // Frequency column may not exist, which is fine
          if (error.code !== 'ER_BAD_FIELD_ERROR') {
            console.log('Note: Could not migrate frequency column:', error.message);
          }
        }
      }
    } catch (error: any) {
      // Ignore error if columns already exist or table doesn't exist yet
      if (error.code !== 'ER_DUP_FIELDNAME' && error.code !== 'ER_NO_SUCH_TABLE') {
        console.log('Note: Migration may have already been applied:', error.message);
      }
    }

    // Shop items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        defaultUnit VARCHAR(50) NOT NULL,
        image VARCHAR(500),
        price DECIMAL(10, 2),
        inStock BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_name (name),
        INDEX idx_inStock (inStock)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    } finally {
      connection.release();
    }
    
    tablesInitialized = true;
  })();
  
  return initializationPromise;
}

// Initialize database connection pool
async function getPool(): Promise<mysql.Pool> {
  await ensureDatabaseInitialized();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

// ==================== GROCERY ITEMS ====================

export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM grocery_items ORDER BY createdAt DESC'
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category ?? undefined,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    purchasedDate: row.purchasedDate ? new Date(row.purchasedDate) : undefined,
    expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
    isPurchased: Boolean(row.isPurchased),
    isExpiring: Boolean(row.isExpiring)
  }));
}

export async function addGroceryItem(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  const pool = await getPool();
  const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem: GroceryItem = {
    id,
    ...item
  };

  await pool.query(
    `INSERT INTO grocery_items 
     (id, name, category, quantity, unit, purchasedDate, expiryDate, isPurchased, isExpiring)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newItem.id,
      newItem.name,
      newItem.category ?? null,
      newItem.quantity ?? null,
      newItem.unit ?? null,
      newItem.purchasedDate ? new Date(newItem.purchasedDate) : null,
      newItem.expiryDate ? new Date(newItem.expiryDate) : null,
      newItem.isPurchased ? 1 : 0,
      newItem.isExpiring ? 1 : 0
    ]
  );

  return newItem;
}

export async function deleteGroceryItem(id: string): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM grocery_items WHERE id = ?', [id]) as [any, any];
  return result.affectedRows > 0;
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM grocery_items WHERE id = ?', [id]) as [any[], any];
  
  if (rows.length === 0) {
    return null;
  }

  const existing = rows[0];
  const updated: GroceryItem = {
    id: existing.id,
    name: updates.name ?? existing.name,
    category: updates.category ?? existing.category,
    quantity: updates.quantity !== undefined ? updates.quantity : (existing.quantity ?? undefined),
    unit: updates.unit !== undefined ? updates.unit : (existing.unit ?? undefined),
    purchasedDate: updates.purchasedDate !== undefined 
      ? updates.purchasedDate 
      : (existing.purchasedDate ? new Date(existing.purchasedDate) : undefined),
    expiryDate: updates.expiryDate !== undefined 
      ? updates.expiryDate 
      : (existing.expiryDate ? new Date(existing.expiryDate) : undefined),
    isPurchased: updates.isPurchased !== undefined ? updates.isPurchased : Boolean(existing.isPurchased),
    isExpiring: updates.isExpiring !== undefined ? updates.isExpiring : Boolean(existing.isExpiring)
  };

  await pool.query(
    `UPDATE grocery_items 
     SET name = ?, category = ?, quantity = ?, unit = ?, purchasedDate = ?, expiryDate = ?, isPurchased = ?, isExpiring = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.category ?? null,
      updated.quantity ?? null,
      updated.unit ?? null,
      updated.purchasedDate ? new Date(updated.purchasedDate) : null,
      updated.expiryDate ? new Date(updated.expiryDate) : null,
      updated.isPurchased ? 1 : 0,
      updated.isExpiring ? 1 : 0,
      id
    ]
  );

  return updated;
}

// ==================== PURCHASE HISTORY ====================

export async function getAllPurchaseHistory(): Promise<PurchaseHistory[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM purchase_history ORDER BY lastPurchased DESC'
  ) as [any[], any];
  
  return rows.map(row => ({
    itemName: row.itemName,
    lastPurchased: new Date(row.lastPurchased),
    totalQuantity: parseFloat(row.totalQuantity) || 0,
    unit: row.unit || 'pcs',
    category: row.category
  }));
}

export async function addOrUpdatePurchaseHistory(history: PurchaseHistory): Promise<void> {
  const pool = await getPool();
  
  // Normalize unit for comparison (case-insensitive, trimmed)
  const normalizedUnit = (history.unit || 'pcs').toLowerCase().trim();
  const normalizedItemName = history.itemName.trim();
  const newQuantity = parseFloat(String(history.totalQuantity)) || 0;
  
  // Check if record exists
  const [existing] = await pool.query(
    'SELECT * FROM purchase_history WHERE itemName = ?',
    [normalizedItemName]
  ) as [any[], any];
  
  if (existing.length > 0) {
    // Update: Add to existing totalQuantity if same unit, otherwise replace
    const existingRecord = existing[0];
    const existingUnit = (existingRecord.unit || 'pcs').toLowerCase().trim();
    const existingQuantity = parseFloat(existingRecord.totalQuantity) || 0;
    
    let newTotalQuantity = newQuantity;
    
    // If same unit, accumulate; otherwise replace
    if (existingUnit === normalizedUnit) {
      newTotalQuantity = existingQuantity + newQuantity;
    }
    
    await pool.query(
      `UPDATE purchase_history 
       SET lastPurchased = ?, totalQuantity = ?, unit = ?, category = ?
       WHERE itemName = ?`,
      [
        new Date(history.lastPurchased),
        newTotalQuantity,
        normalizedUnit,
        history.category || 'other',
        normalizedItemName
      ]
    );
  } else {
    // Insert new record
    await pool.query(
      `INSERT INTO purchase_history (itemName, lastPurchased, totalQuantity, unit, category)
       VALUES (?, ?, ?, ?, ?)`,
      [
        normalizedItemName,
        new Date(history.lastPurchased),
        newQuantity,
        normalizedUnit,
        history.category || 'other'
      ]
    );
  }
}

// ==================== SHOP ITEMS ====================

export interface ShopItemDB {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
  inStock: boolean;
}

export async function getAllShopItems(): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM shop_items ORDER BY name ASC'
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function getShopItemsByCategory(category: string): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE category = ? ORDER BY name ASC',
    [category]
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function searchShopItemsDB(query: string): Promise<ShopItemDB[]> {
  const pool = await getPool();
  const searchTerm = `%${query.toLowerCase()}%`;
  const [rows] = await pool.query(
    'SELECT * FROM shop_items WHERE LOWER(name) LIKE ? ORDER BY name ASC',
    [searchTerm]
  ) as [any[], any];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    defaultUnit: row.defaultUnit,
    image: row.image ?? undefined,
    price: row.price ?? undefined,
    inStock: Boolean(row.inStock)
  }));
}

export async function addShopItem(item: ShopItemDB): Promise<ShopItemDB> {
  const pool = await getPool();
  
  await pool.query(
    `INSERT INTO shop_items (id, name, category, defaultUnit, image, price, inStock)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.category,
      item.defaultUnit,
      item.image ?? null,
      item.price ?? null,
      item.inStock ? 1 : 0
    ]
  );

  return item;
}

export async function updateShopItem(id: string, updates: Partial<ShopItemDB>): Promise<ShopItemDB | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM shop_items WHERE id = ?', [id]) as [any[], any];
  
  if (rows.length === 0) {
    return null;
  }

  const existing = rows[0];
  const updated: ShopItemDB = {
    id: existing.id,
    name: updates.name ?? existing.name,
    category: updates.category ?? existing.category,
    defaultUnit: updates.defaultUnit ?? existing.defaultUnit,
    image: updates.image !== undefined ? updates.image : (existing.image ?? undefined),
    price: updates.price !== undefined ? updates.price : (existing.price ?? undefined),
    inStock: updates.inStock !== undefined ? updates.inStock : Boolean(existing.inStock)
  };

  await pool.query(
    `UPDATE shop_items 
     SET name = ?, category = ?, defaultUnit = ?, image = ?, price = ?, inStock = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.category,
      updated.defaultUnit,
      updated.image ?? null,
      updated.price ?? null,
      updated.inStock ? 1 : 0,
      id
    ]
  );

  return updated;
}

export async function deleteShopItem(id: string): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM shop_items WHERE id = ?', [id]) as [any, any];
  return result.affectedRows > 0;
}

export async function getCategoriesWithItemCounts(): Promise<{ category: { id: string; name: string; icon: string }; count: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT category, COUNT(*) as count 
     FROM shop_items 
     GROUP BY category`
  ) as [any[], any];

  const categoryMap = new Map(rows.map((row: any) => [row.category, row.count]));
  
  return SHOP_CATEGORIES.map(cat => ({
    category: cat,
    count: categoryMap.get(cat.id) || 0
  }));
}

export async function initializeShopData(): Promise<void> {
  const pool = await getPool();
  
  // Check if shop items already exist
  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM shop_items') as [any[], any];
  const count = countRows[0]?.count || 0;
  
  if (count === 0) {
    // Insert all shop items from seed data
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of SHOP_ITEMS) {
        await connection.query(
          `INSERT INTO shop_items (id, name, category, defaultUnit, image, price, inStock)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.name,
            item.category,
            item.defaultUnit,
            item.image ?? null,
            item.price ?? null,
            1 // inStock = true by default
          ]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

// ==================== SAMPLE DATA INITIALIZATION ====================

export async function initializeSampleData(): Promise<void> {
  // Initialize shop data
  await initializeShopData();
  
  const pool = await getPool();
  
  // Check if grocery items already exist
  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM grocery_items') as [any[], any];
  const count = countRows[0]?.count || 0;
  
  if (count === 0) {
    // Add some sample grocery items
    const sampleItems: Omit<GroceryItem, 'id'>[] = [
      {
        name: 'Milk',
        category: 'dairy',
        quantity: 1,
        unit: 'L',
        isPurchased: false
      },
      {
        name: 'Bread',
        category: 'bread',
        quantity: 1,
        unit: 'loaf',
        isPurchased: false
      },
      {
        name: 'Eggs',
        category: 'dairy',
        quantity: 12,
        unit: 'pcs',
        isPurchased: false
      }
    ];

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of sampleItems) {
        const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await connection.query(
          `INSERT INTO grocery_items (id, name, category, quantity, unit, purchasedDate, expiryDate, isPurchased, isExpiring)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.name,
            item.category,
            item.quantity ?? null,
            item.unit ?? null,
            item.purchasedDate ? new Date(item.purchasedDate) : null,
            item.expiryDate ? new Date(item.expiryDate) : null,
            item.isPurchased ? 1 : 0,
            item.isExpiring ? 1 : 0
          ]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

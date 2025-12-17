/**
 * MySQL Database Setup Script
 * 
 * This script initializes the MySQL database with all tables and sample data.
 * 
 * Prerequisites:
 * 1. MySQL Server must be installed and running
 * 2. Create a database named 'grocery_shop':
 *    mysql -u root -p -e "CREATE DATABASE grocery_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
 * 
 * Usage:
 *   npx ts-node scripts/setup-mysql.ts
 * 
 * Or set environment variables:
 *   MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD=yourpassword npx ts-node scripts/setup-mysql.ts
 */

import { 
  initializeDatabase, 
  initializeSampleData, 
  initializeShopData,
  closeDatabase 
} from '../src/lib/mysql-database';

async function setup() {
  console.log('🚀 Starting MySQL database setup...\n');
  
  try {
    // Step 1: Initialize database schema
    console.log('📦 Creating database tables...');
    await initializeDatabase();
    
    // Step 2: Initialize sample purchase history
    console.log('📝 Initializing sample purchase history...');
    await initializeSampleData();
    
    // Step 3: Initialize shop data (categories and items)
    console.log('🏪 Initializing shop catalog...');
    await initializeShopData();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📋 Tables created:');
    console.log('   - grocery_items');
    console.log('   - purchase_history');
    console.log('   - shop_categories');
    console.log('   - shop_items');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Check your database credentials in src/lib/db-config.ts');
    console.log('   3. Create the database: CREATE DATABASE grocery_shop;');
    console.log('   4. Grant necessary permissions to your MySQL user');
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

setup();


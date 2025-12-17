// MySQL Database Configuration
// Update these values with your MySQL server credentials

export const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'grocery_shop',
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable multiple statements for schema initialization
  multipleStatements: true,
};

// Instructions for setting up MySQL:
// 1. Install MySQL Server if not already installed
// 2. Create the database: CREATE DATABASE grocery_shop;
// 3. Create a .env.local file in the project root with:
//    MYSQL_HOST=localhost
//    MYSQL_PORT=3306
//    MYSQL_USER=root
//    MYSQL_PASSWORD=your_password
//    MYSQL_DATABASE=grocery_shop


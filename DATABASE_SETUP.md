# MySQL Database Setup Guide

This project uses MySQL as the backend database. Follow these steps to set up the database.

## Prerequisites

1. **MySQL Server** must be installed and running
   - Windows: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Mac: `brew install mysql`
   - Linux: `sudo apt install mysql-server`

2. **Node.js** (v18 or later)

## Setup Steps

### Step 1: Start MySQL Server

```bash
# Windows (if installed as service)
net start mysql

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Step 2: Create the Database

Connect to MySQL and create the database:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE grocery_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=grocery_shop
```

### Step 4: Initialize the Database

Run the setup script to create tables and seed data:

```bash
npm run db:setup
```

Or manually, the tables will be created automatically when you start the app.

### Step 5: Start the Application

```bash
npm run dev
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `grocery_items` | User's grocery list items |
| `purchase_history` | Track purchase patterns for AI suggestions |
| `shop_categories` | Product categories (Dairy, Meat, etc.) |
| `shop_items` | Complete shop catalog (204 items) |

### Table: `grocery_items`

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key |
| name | VARCHAR(255) | Item name |
| category | VARCHAR(100) | Category (dairy, meat, etc.) |
| quantity | DECIMAL(10,2) | Quantity |
| unit | VARCHAR(50) | Unit (kg, L, pcs, etc.) |
| purchased_date | DATETIME | When purchased |
| expiry_date | DATETIME | Expiry date |
| is_purchased | TINYINT(1) | Purchase status |
| is_expiring | TINYINT(1) | Expiring flag |

### Table: `shop_items`

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(100) | Primary key |
| name | VARCHAR(255) | Product name |
| category | VARCHAR(50) | Category ID |
| default_unit | VARCHAR(50) | Default unit |
| image | VARCHAR(500) | Image URL (optional) |
| price | DECIMAL(10,2) | Price (optional) |
| in_stock | TINYINT(1) | Stock status |

## API Endpoints

### Shop Items API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop-items` | Get all items |
| GET | `/api/shop-items?category=dairy` | Filter by category |
| GET | `/api/shop-items?search=milk` | Search items |
| GET | `/api/shop-items?includeCategories=true` | Include categories |
| POST | `/api/shop-items` | Add new item |
| PUT | `/api/shop-items` | Update item |
| DELETE | `/api/shop-items?id=xxx` | Delete item |

### Grocery List API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grocery-list` | Get grocery list |
| POST | `/api/grocery-list` | Add item to list |
| PATCH | `/api/grocery-list` | Update item |
| DELETE | `/api/grocery-list?id=xxx` | Remove item |

## Troubleshooting

### Error: Connection refused

- Make sure MySQL server is running
- Check if the port (default: 3306) is correct
- Verify firewall settings

### Error: Access denied

- Check username and password in `.env.local`
- Make sure the user has permissions:
  ```sql
  GRANT ALL PRIVILEGES ON grocery_shop.* TO 'your_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

### Error: Database does not exist

- Create the database manually:
  ```sql
  CREATE DATABASE grocery_shop;
  ```

## Switching Back to SQLite

If you want to use SQLite instead of MySQL:

1. Update imports in `lib/storage.ts`:
   ```typescript
   // Change from:
   import { ... } from '@/lib/mysql-database';
   // To:
   import { ... } from '@/lib/database';
   ```

2. Update `app/api/shop-items/route.ts` similarly

3. The SQLite database file will be created in `data/grocery.db`


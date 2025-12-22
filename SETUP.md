# Environment Setup Guide

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env.local
   
   # macOS/Linux
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and update the MySQL password:**
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```

3. **Make sure MySQL is running** before starting the application.

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL server hostname | `localhost` | No |
| `DB_PORT` | MySQL server port | `3306` | No |
| `DB_USER` | MySQL username | `root` | No |
| `DB_PASSWORD` | MySQL password | (empty) | **Yes** |
| `DB_NAME` | Database name | `grocery_db` | No |

## Verification

After setting up your `.env.local` file, you can verify the connection by:

1. Starting the development server:
   ```bash
   npm run dev
   ```

2. Check the console for any database connection errors. If MySQL is properly configured, the database and tables will be created automatically on first run.

## Troubleshooting

### Connection Refused
- Make sure MySQL server is running
- Verify the `DB_HOST` and `DB_PORT` are correct
- Check if MySQL is listening on the specified port

### Access Denied
- Verify your `DB_USER` and `DB_PASSWORD` are correct
- Make sure the MySQL user has permission to create databases
- Try connecting with MySQL command line: `mysql -u root -p`

### Database Already Exists
- The application will use the existing database if it's already created
- Tables will be created automatically if they don't exist


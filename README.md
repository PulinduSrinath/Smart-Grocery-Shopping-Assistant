# Smart Grocery Shopping Assistant

An AI-powered grocery list management application built with Next.js that helps users manage their grocery lists with intelligent suggestions.

## Features

### 💬 Interactive Chatbot
- **AI Chat Assistant**: Floating chat icon with intelligent conversation interface
- **Natural Language Commands**: Add items, get suggestions, and ask questions using natural language
- **Smart Responses**: Context-aware responses that understand your grocery shopping needs
- **Examples**: 
  - "add milk" - Adds milk to your list
  - "show suggestions" - Displays smart suggestions
  - "what should I buy?" - Gets personalized recommendations

### 🤖 Rule-Based Reasoning
- **Missing Item Prediction**: The assistant analyzes your purchase history and suggests items you typically buy but haven't added to your current list (e.g., "You bought milk last week, should I add it again?")

### 🥗 Healthier Alternatives
- **Smart Substitutions**: Suggests healthier alternatives for common grocery items
  - White bread → Brown bread (more fiber and nutrients)
  - White rice → Red rice or Samba rice (more fiber, lower glycemic index)
  - Soda → King coconut (thambili) or fresh fruit juice (natural hydration)
  - Sugar → Kithul jaggery (natural sweetener with minerals)
  - Refined flour → Kurakkan flour (finger millet - high in iron and calcium)
  - Regular coconut oil → Virgin coconut oil (less processed)
  - And many more...

### 🇱🇰 Sri Lankan Cultural Food Support
- **Cultural Essentials**: Suggestions for authentic Sri Lankan ingredients
  - Rice varieties (Red rice, Samba rice)
  - Spices (Cinnamon, Cardamom, Turmeric, Curry leaves, Pandan leaves)
  - Traditional vegetables (Gotukola, Mukunuwenna)
  - Natural sweeteners (Kithul jaggery)
  - Healthy flours (Kurakkan flour)
  - King coconut (Thambili) for natural hydration
  - Dhal and green gram for protein
- **Cultural Suggestions**: Automatically suggests Sri Lankan essentials based on purchase patterns

### ⏰ Expiring Items Reminder
- **Smart Reminders**: Tracks purchase dates and reminds you about items that are expiring soon based on category-specific expiry periods
- **Category-Based Expiry Tracking**: Different expiry periods for different categories (dairy: 7 days, meat: 3 days, vegetables: 5 days, etc.)

### 🎨 Professional Design
- **Modern UI**: Clean, professional interface with blue gradient theme
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Sticky Header**: Professional navigation header with logo and menu
- **Smooth Animations**: Polished interactions and transitions throughout

### 📊 Complete CRUD Operations
- **CREATE**: Add new items with validation and error handling
- **READ**: View all items or fetch individual items by ID
- **UPDATE**: Edit items with a modal form (name, category, dates)
- **DELETE**: Remove items with confirmation dialog
- **Notifications**: Success and error notifications for all operations
- **API Validation**: Comprehensive input validation and error handling

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Items
1. Enter the item name in the input field
2. Select the appropriate category
3. Click "Add Item" or press Enter

### Managing Your List
- **Mark as Purchased**: Click "Mark Purchased" to track items you've bought
- **Remove Items**: Click "Remove" to delete items from your list
- **View Suggestions**: The assistant automatically shows suggestions at the top of the page

### Using the Chatbot
- **Open Chat**: Click the floating chat icon in the bottom right corner
- **Natural Commands**: Type commands like:
  - "add [item name]" - Add items to your list
  - "show suggestions" - Get smart suggestions
  - "help" - See available commands
  - "what should I buy?" - Get recommendations
- **Interactive**: The chatbot understands context and provides helpful responses

### CRUD Operations
- **CREATE**: Use the "Add New Item" form or chatbot to add items
- **READ**: View all items in your list with details (category, dates, status)
- **UPDATE**: Click "Edit" button on any item to modify it using the modal form
- **DELETE**: Click "Delete" button and confirm to remove items
- **Notifications**: All operations show success/error notifications

### Interacting with Suggestions
- **Missing Items**: Click "Add to List" to add suggested items, or "Dismiss" to ignore
- **Healthier Alternatives**: Click "Replace with [alternative]" to swap items, or "Keep Original" to dismiss
- **Expiring Reminders**: Click "Dismiss" to acknowledge the reminder

## How It Works

### Rule-Based Reasoning
The system uses purchase history to predict missing items:
- Tracks when items were last purchased
- Calculates typical purchase frequency
- Suggests items when it's time to repurchase

### Healthier Alternatives
A predefined mapping of common items to healthier alternatives with explanations for each suggestion.

### Expiry Tracking
- Uses category-based expiry periods
- Calculates days until expiry based on purchase date
- Shows warnings for items expiring within 3 days

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── grocery-list/        # CRUD operations API routes
│   │   │   ├── route.ts         # GET, POST, PATCH, DELETE endpoints
│   │   │   └── purchase/        # Mark as purchased endpoint
│   │   └── suggestions/         # Get AI suggestions
│   ├── about/                   # About page
│   │   └── page.tsx
│   ├── globals.css              # Global styles with professional design
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application page
├── components/
│   ├── ChatBot.tsx             # Interactive chatbot component
│   ├── EditItemModal.tsx       # Modal for editing items
│   └── Notification.tsx        # Success/error notifications
├── lib/
│   ├── rules.ts                 # Rule-based reasoning logic
│   └── storage.ts               # In-memory data storage
├── types/
│   └── index.ts                 # TypeScript type definitions
└── package.json
```

## API Endpoints

### Grocery List API (`/api/grocery-list`)

- **GET**: Fetch all items or a single item by ID
  - Query params: `?id=<item-id>` (optional)
- **POST**: Create a new item
  - Body: `{ name: string, category: string, purchasedDate?: Date, expiryDate?: Date }`
- **PATCH**: Update an existing item
  - Body: `{ id: string, name?: string, category?: string, ... }`
- **DELETE**: Remove an item
  - Query params: `?id=<item-id>`

### Purchase API (`/api/grocery-list/purchase`)

- **POST**: Mark an item as purchased
  - Body: `{ id: string }`

### Suggestions API (`/api/suggestions`)

- **GET**: Get all AI suggestions (missing items, healthier alternatives, expiring items)

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **CSS**: Custom styling with modern design
- **RESTful API**: Clean API architecture with proper HTTP methods

## Future Enhancements

- Database integration for persistent storage
- User authentication and multiple lists
- Machine learning for better predictions
- Barcode scanning for item addition
- Recipe-based suggestions
- Price tracking and budget management

## License

MIT License


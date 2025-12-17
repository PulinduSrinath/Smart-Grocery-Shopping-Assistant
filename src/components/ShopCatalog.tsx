'use client';

import { useState, useEffect } from 'react';

// Types for shop items from database
interface ShopItemDB {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  image?: string;
  price?: number;
  inStock: boolean;
}

interface ShopCategoryDB {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

interface ShopCatalogProps {
  onAddItem: (name: string, category: string, quantity: number, unit: string) => void;
  currentItems: string[];
}

export default function ShopCatalog({ onAddItem, currentItems }: ShopCatalogProps) {
  const [items, setItems] = useState<ShopItemDB[]>([]);
  const [categories, setCategories] = useState<{ category: ShopCategoryDB; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop-items?includeCategories=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch shop items');
        }
        
        const data = await response.json();
        setItems(data.items || []);
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching shop items:', err);
        setError('Failed to load shop items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter items based on search and category
  const getFilteredItems = (): ShopItemDB[] => {
    let filtered = items;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Check if item is already in the list
  const isInList = (itemName: string): boolean => {
    return currentItems.some(item => item.toLowerCase() === itemName.toLowerCase());
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, value) }));
  };

  // Handle add to list
  const handleAddToList = (item: ShopItemDB) => {
    const quantity = quantities[item.id] || 1;
    
    // Map shop categories to app categories
    const categoryMap: Record<string, string> = {
      'dairy': 'dairy',
      'meat': 'meat',
      'vegetables': 'vegetables',
      'fruits': 'fruits',
      'bread': 'bread',
      'beverages': 'beverages',
      'snacks': 'snacks',
      'grains': 'other',
      'spices': 'other',
      'frozen': 'other',
      'canned': 'other',
      'household': 'other',
      'personal': 'other',
      'other': 'other'
    };
    
    onAddItem(item.name, categoryMap[item.category] || 'other', quantity, item.defaultUnit);
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string): string => {
    const category = categories.find(c => c.category.id === categoryId);
    return category?.category.icon || '📦';
  };

  // Get category name
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.category.id === categoryId);
    return category?.category.name || 'Other';
  };

  // Calculate total items count
  const totalItemsCount = items.length;

  if (loading) {
    return (
      <div className="shop-catalog">
        <div className="catalog-header">
          <h2 className="catalog-title">🏪 Shop Catalog</h2>
          <p className="catalog-subtitle">Loading items from database...</p>
        </div>
        <div className="catalog-loading">
          <div className="loading-spinner"></div>
          <p>Loading shop items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-catalog">
        <div className="catalog-header">
          <h2 className="catalog-title">🏪 Shop Catalog</h2>
        </div>
        <div className="catalog-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button 
            className="retry-btn" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-catalog">
      <div className="catalog-header">
        <h2 className="catalog-title">🏪 Shop Catalog</h2>
        <p className="catalog-subtitle">Browse all available items and add them to your list ({totalItemsCount} items in database)</p>
      </div>

      {/* Search Bar */}
      <div className="catalog-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="catalog-search-input"
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          📋 All ({totalItemsCount})
        </button>
        {categories.map(({ category: cat, count }) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon} {cat.name} ({count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        {searchQuery && ` for "${searchQuery}"`}
        {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
      </div>

      {/* Items Grid */}
      <div className="catalog-grid">
        {filteredItems.map(item => {
          const inList = isInList(item.name);
          const quantity = quantities[item.id] || 1;
          
          return (
            <div key={item.id} className={`catalog-item ${inList ? 'in-list' : ''} ${!item.inStock ? 'out-of-stock' : ''}`}>
              <div className="item-icon">{getCategoryIcon(item.category)}</div>
              <div className="item-details">
                <h4 className="item-title">{item.name}</h4>
                <span className="item-unit">per {item.defaultUnit}</span>
                {!item.inStock && <span className="stock-badge out">Out of Stock</span>}
              </div>
              
              {inList ? (
                <div className="in-list-badge">
                  ✓ In List
                </div>
              ) : item.inStock ? (
                <div className="item-actions">
                  <div className="quantity-control">
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      min="1"
                      className="qty-input"
                    />
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="add-btn"
                    onClick={() => handleAddToList(item)}
                  >
                    + Add
                  </button>
                </div>
              ) : (
                <div className="unavailable-badge">
                  Unavailable
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>No items found</p>
          <button className="clear-filters-btn" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

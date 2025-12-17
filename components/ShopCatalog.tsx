'use client';

import { useState } from 'react';
import { SHOP_ITEMS, SHOP_CATEGORIES, ShopItem, searchShopItems, getItemsByCategory } from '@/lib/shopItems';

interface ShopCatalogProps {
  onAddItem: (name: string, category: string, quantity: number, unit: string) => void;
  currentItems: string[];
}

export default function ShopCatalog({ onAddItem, currentItems }: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Filter items based on search and category
  const getFilteredItems = (): ShopItem[] => {
    let items = SHOP_ITEMS;
    
    if (searchQuery) {
      items = searchShopItems(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
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
  const handleAddToList = (item: ShopItem) => {
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
    const category = SHOP_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || '📦';
  };

  return (
    <div className="shop-catalog">
      <div className="catalog-header">
        <h2 className="catalog-title">🏪 Shop Catalog</h2>
        <p className="catalog-subtitle">Browse all available items and add them to your list</p>
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
          📋 All ({SHOP_ITEMS.length})
        </button>
        {SHOP_CATEGORIES.map(cat => {
          const count = SHOP_ITEMS.filter(item => item.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        {searchQuery && ` for "${searchQuery}"`}
        {selectedCategory !== 'all' && ` in ${SHOP_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
      </div>

      {/* Items Grid */}
      <div className="catalog-grid">
        {filteredItems.map(item => {
          const inList = isInList(item.name);
          const quantity = quantities[item.id] || 1;
          
          return (
            <div key={item.id} className={`catalog-item ${inList ? 'in-list' : ''}`}>
              <div className="item-icon">{getCategoryIcon(item.category)}</div>
              <div className="item-details">
                <h4 className="item-title">{item.name}</h4>
                <span className="item-unit">per {item.defaultUnit}</span>
              </div>
              
              {inList ? (
                <div className="in-list-badge">
                  ✓ In List
                </div>
              ) : (
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


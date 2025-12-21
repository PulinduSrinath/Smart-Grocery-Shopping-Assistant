'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';
import ChatBot from '@/components/ChatBot';
import EditItemModal from '@/components/EditItemModal';
import AssistantPopup, { AssistantMessage, generateAssistantMessage } from '@/components/AssistantPopup';
import ShopCatalog from '@/components/ShopCatalog';

export default function Home() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'other', quantity: '', unit: 'pcs' });
  const [stats, setStats] = useState({ total: 0, purchased: 0, pending: 0 });
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [assistantPopup, setAssistantPopup] = useState<{
    message: AssistantMessage | null;
    isVisible: boolean;
  }>({
    message: null,
    isVisible: false
  });

  const categories = ['dairy', 'meat', 'vegetables', 'fruits', 'bread', 'beverages', 'snacks', 'other'];

  useEffect(() => {
    loadData();
  }, []);

  const showAssistantPopup = (itemName: string, category: string) => {
    const existingItems = groceryList.map(item => item.name);
    const message = generateAssistantMessage('added', itemName, existingItems, category);
    setAssistantPopup({ message, isVisible: true });
  };

  const hideAssistantPopup = () => {
    setAssistantPopup(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddFromPopup = async (itemName: string) => {
    hideAssistantPopup();
    const category = detectCategory(itemName);
    await addItem(itemName, category, 1, 'pcs');
  };

  const detectCategory = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter') || name.includes('curd') || name.includes('eggs')) return 'dairy';
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish') || name.includes('meat')) return 'meat';
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('berry') || name.includes('fruit')) return 'fruits';
    if (name.includes('lettuce') || name.includes('carrot') || name.includes('tomato') || name.includes('onion') || name.includes('vegetable') || name.includes('dhal') || name.includes('curry leaves')) return 'vegetables';
    if (name.includes('bread') || name.includes('bagel') || name.includes('roll') || name.includes('roti')) return 'bread';
    if (name.includes('water') || name.includes('juice') || name.includes('soda') || name.includes('drink') || name.includes('coconut')) return 'beverages';
    if (name.includes('chip') || name.includes('cracker') || name.includes('cookie') || name.includes('snack')) return 'snacks';
    return 'other';
  };

  const loadData = async () => {
    try {
      const listRes = await fetch('/api/grocery-list');

      if (!listRes.ok) {
        throw new Error('Failed to load data');
      }

      const listData = await listRes.json();
      setGroceryList(listData.list || []);
      updateStats(listData.list || []);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (list: GroceryItem[]) => {
    setStats({
      total: list.length,
      purchased: list.filter(item => item.isPurchased).length,
      pending: list.filter(item => !item.isPurchased).length
    });
  };

  // CREATE - Add new item
  const addItem = async (name?: string, category?: string, quantity?: number, unit?: string) => {
    const itemName = name || newItem.name;
    const itemCategory = category || newItem.category;
    const itemQuantity = quantity !== undefined ? quantity : (newItem.quantity ? parseFloat(newItem.quantity) : undefined);
    const itemUnit = unit || newItem.unit;
    
    if (!itemName.trim()) {
      alert('Item name is required');
      return;
    }

    try {
      const body: any = { name: itemName, category: itemCategory };
      if (itemQuantity && itemQuantity > 0) {
        body.quantity = itemQuantity;
        body.unit = itemUnit;
      }
      
      const res = await fetch('/api/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        setGroceryList([...groceryList, data.item]);
        if (!name) {
          setNewItem({ name: '', category: 'other', quantity: '', unit: 'pcs' });
        }
        // Show assistant popup with contextual message
        showAssistantPopup(itemName, itemCategory);
        loadData();
      } else {
        const errorData = await res.json();
        // Check if duplicate
        if (errorData.error?.toLowerCase().includes('already') || errorData.error?.toLowerCase().includes('duplicate')) {
          const duplicateMessage: AssistantMessage = {
            id: `dup-${Date.now()}`,
            type: 'duplicate',
            title: 'Already in your list!',
            message: `You already have "${itemName}" in your grocery list. Would you like to increase the quantity instead?`,
            itemName,
          };
          setAssistantPopup({ message: duplicateMessage, isVisible: true });
        } else {
          console.error(errorData.error || 'Failed to add item');
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      console.error('Failed to add item. Please try again.');
    }
  };

  // READ - Get single item (for editing)
  const getItem = (id: string): GroceryItem | undefined => {
    return groceryList.find(item => item.id === id);
  };

  // UPDATE - Edit item
  const updateItem = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      const res = await fetch('/api/grocery-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (res.ok) {
        const data = await res.json();
        setGroceryList(groceryList.map(item => 
          item.id === id ? data.item : item
        ));
        // Item updated successfully
        loadData();
      } else {
        const errorData = await res.json();
        console.error(errorData.error || 'Failed to update item');
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // DELETE - Remove item
  const removeItem = async (id: string) => {
    const item = getItem(id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/grocery-list?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setGroceryList(groceryList.filter(item => item.id !== id));
        // Item deleted successfully
        loadData();
      } else {
        const errorData = await res.json();
        console.error(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      console.error('Failed to delete item. Please try again.');
    }
  };

  const markPurchased = async (id: string) => {
    try {
      const res = await fetch('/api/grocery-list/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        const item = getItem(id);
        // Item marked as purchased
        loadData();
      } else {
        console.error('Failed to mark item as purchased');
      }
    } catch (error) {
      console.error('Error marking as purchased:', error);
      console.error('Failed to update item. Please try again.');
    }
  };

  const handleEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (id: string, updates: Partial<GroceryItem>) => {
    await updateItem(id, updates);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleGetSuggestions = () => {
    loadData();
  };

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    dairy: '🥛',
    meat: '🥩',
    vegetables: '🥬',
    fruits: '🍎',
    bread: '🍞',
    beverages: '🥤',
    snacks: '🍿',
    other: '📦'
  };

  // Filter grocery list based on search and filters
  const filteredList = groceryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !item.isPurchased) ||
      (filterStatus === 'purchased' && item.isPurchased);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group items by category
  const groupedByCategory = filteredList.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  if (loading) {
    return (
      <>
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🛒</div>
              <span>Smart Grocery Assistant</span>
            </div>
            <nav>
              <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/list">List</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p>Loading your grocery list...</p>
          </div>
        </div>
        <ChatBot 
          onAddItem={addItem} 
          onGetSuggestions={handleGetSuggestions}
          currentListCount={groceryList.length}
        />
      </>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🛒</div>
            <span>Smart Grocery Assistant</span>
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="/list">List</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <AssistantPopup
        message={assistantPopup.message}
        isVisible={assistantPopup.isVisible}
        onClose={hideAssistantPopup}
        onAddSuggestion={handleAddFromPopup}
      />

      <div className="container">
        <h1>Smart Grocery Shopping Assistant</h1>
        <p className="subtitle">AI-powered grocery list manager with intelligent suggestions and full CRUD operations</p>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.purchased}</div>
            <div className="stat-label">Purchased</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">➕ Create - Add New Item</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Item name (e.g., milk, bread, eggs)"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Qty"
              min="0"
              step="0.1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              style={{ width: '100px' }}
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              style={{ width: '100px' }}
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="mL">mL</option>
              <option value="pack">pack</option>
              <option value="bunch">bunch</option>
              <option value="bottle">bottle</option>
              <option value="box">box</option>
            </select>
            <button className="btn btn-primary" onClick={() => addItem()}>
              <span>➕ Add Item</span>
            </button>
          </div>
        </div>

        <div className="section">
          <div className="grocery-list-header">
            <h2 className="section-title" style={{ margin: 0 }}>🛒 Your Grocery List</h2>
            <div className="list-summary">
              <span className="summary-badge total">{groceryList.length} items</span>
              <span className="summary-badge pending">{stats.pending} pending</span>
              <span className="summary-badge purchased">{stats.purchased} purchased</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="list-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
            <div className="filter-controls">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">🔴 Pending</option>
                <option value="purchased">✅ Purchased</option>
              </select>
            </div>
          </div>

          {groceryList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>Your grocery list is empty. Add some items to get started!</p>
              <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Or try chatting with the assistant by clicking the chat icon in the bottom right corner.</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No items match your search or filters.</p>
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grocery-table-container">
              {/* Table Header */}
              <div className="grocery-table-header">
                <div className="col-status">Status</div>
                <div className="col-item">Item</div>
                <div className="col-category">Category</div>
                <div className="col-quantity">Quantity</div>
                <div className="col-actions">Actions</div>
              </div>

              {/* Group by Category */}
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <div key={category} className="category-group">
                  <div className="category-header">
                    <span className="category-icon">{categoryIcons[category] || '📦'}</span>
                    <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span className="category-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`grocery-table-row ${item.isPurchased ? 'purchased' : ''} ${item.isExpiring ? 'expiring' : ''}`}
                    >
                      <div className="col-status">
                        <button
                          className={`status-checkbox ${item.isPurchased ? 'checked' : ''}`}
                          onClick={() => !item.isPurchased && markPurchased(item.id)}
                          title={item.isPurchased ? 'Already purchased' : 'Mark as purchased'}
                        >
                          {item.isPurchased ? '✓' : ''}
                        </button>
                      </div>
                      <div className="col-item">
                        <div className="item-name-cell">
                          <span className={item.isPurchased ? 'strikethrough' : ''}>{item.name}</span>
                          {item.isExpiring && <span className="expiring-badge">⚠️ Expiring</span>}
                        </div>
                        {item.purchasedDate && (
                          <div className="item-date">Purchased: {new Date(item.purchasedDate).toLocaleDateString()}</div>
                        )}
                      </div>
                      <div className="col-category">
                        <span className="category-pill">{categoryIcons[item.category] || '📦'} {item.category}</span>
                      </div>
                      <div className="col-quantity">
                        {item.quantity ? (
                          <span className="quantity-badge">{item.quantity} {item.unit || 'pcs'}</span>
                        ) : (
                          <span className="quantity-na">-</span>
                        )}
                      </div>
                      <div className="col-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(item)}
                          title="Edit item"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => removeItem(item.id)}
                          title="Delete item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shop Catalog Section */}
        <div className="section">
          <ShopCatalog
            onAddItem={addItem}
            currentItems={groceryList.map(item => item.name)}
          />
        </div>
      </div>

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <ChatBot 
        onAddItem={addItem} 
        onGetSuggestions={handleGetSuggestions}
        currentListCount={groceryList.length}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { GroceryItem, Suggestion } from '@/types';
import ChatBot from '@/components/ChatBot';
import EditItemModal from '@/components/EditItemModal';
import Notification from '@/components/Notification';
import SriLankanSuggestions from '@/components/SriLankanSuggestions';
import CollapsibleSection from '@/components/CollapsibleSection';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}

export default function Home() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'other', quantity: '', unit: 'pcs' });
  const [stats, setStats] = useState({ total: 0, purchased: 0, pending: 0 });
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState<string>('all');
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const categories = ['dairy', 'meat', 'vegetables', 'fruits', 'bread', 'beverages', 'snacks', 'other'];

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const loadData = async () => {
    try {
      const [listRes, suggestionsRes] = await Promise.all([
        fetch('/api/grocery-list'),
        fetch('/api/suggestions')
      ]);

      if (!listRes.ok || !suggestionsRes.ok) {
        throw new Error('Failed to load data');
      }

      const listData = await listRes.json();
      const suggestionsData = await suggestionsRes.json();

      setGroceryList(listData.list || []);
      setSuggestions(suggestionsData.suggestions || []);
      updateStats(listData.list || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load grocery list', 'error');
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
      showNotification('Item name is required', 'error');
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
        showNotification(`"${itemName}" added successfully!`, 'success');
        loadData();
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to add item', 'error');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Failed to add item. Please try again.', 'error');
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
        showNotification('Item updated successfully!', 'success');
        loadData();
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to update item', 'error');
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
        showNotification(`"${item.name}" deleted successfully`, 'success');
        loadData();
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to delete item', 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showNotification('Failed to delete item. Please try again.', 'error');
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
        showNotification(`"${item?.name || 'Item'}" marked as purchased!`, 'success');
        loadData();
      } else {
        showNotification('Failed to mark item as purchased', 'error');
      }
    } catch (error) {
      console.error('Error marking as purchased:', error);
      showNotification('Failed to update item. Please try again.', 'error');
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

  const addSuggestedItem = async (item: GroceryItem) => {
    try {
      const res = await fetch('/api/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          category: item.category
        })
      });

      if (res.ok) {
        showNotification(`"${item.name}" added to your list!`, 'success');
        loadData();
      }
    } catch (error) {
      console.error('Error adding suggested item:', error);
      showNotification('Failed to add suggested item', 'error');
    }
  };

  const replaceWithAlternative = async (originalItem: GroceryItem, alternative: string) => {
    try {
      const res = await fetch('/api/grocery-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: originalItem.id,
          name: alternative
        })
      });

      if (res.ok) {
        showNotification(`Replaced with "${alternative}"!`, 'success');
        loadData();
      }
    } catch (error) {
      console.error('Error replacing item:', error);
      showNotification('Failed to replace item', 'error');
    }
  };

  const handleGetSuggestions = () => {
    loadData();
  };

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
        <ChatBot onAddItem={addItem} onGetSuggestions={handleGetSuggestions} />
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

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>📋 Read - Your Grocery List</h2>
            <a href="/list" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              📋 View Full List →
            </a>
          </div>
          {groceryList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p>Your grocery list is empty. Add some items to get started!</p>
              <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Or try chatting with the assistant by clicking the chat icon in the bottom right corner.</p>
            </div>
          ) : (
            <ul className="grocery-list">
              {groceryList.map((item) => (
                <li
                  key={item.id}
                  className={`grocery-item ${item.isPurchased ? 'purchased' : ''} ${item.isExpiring ? 'expiring' : ''}`}
                >
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    {item.quantity && (
                      <div className="item-category" style={{ fontWeight: 600, color: '#3b82f6', marginTop: '4px' }}>
                        Quantity: {item.quantity} {item.unit || 'pcs'}
                      </div>
                    )}
                    <div className="item-category">{item.category}</div>
                    {item.purchasedDate && (
                      <div className="item-category" style={{ fontSize: '0.75rem', marginTop: '5px' }}>
                        Purchased: {new Date(item.purchasedDate).toLocaleDateString()}
                      </div>
                    )}
                    {item.expiryDate && (
                      <div className="item-category" style={{ fontSize: '0.75rem', marginTop: '5px' }}>
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    {!item.isPurchased && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => markPurchased(item.id)}
                        title="Mark as purchased"
                      >
                        ✓ Purchase
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleEdit(item)}
                      title="Edit item"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => removeItem(item.id)}
                      title="Delete item"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="section">
          <SriLankanSuggestions
            onAddItem={addItem}
            currentItems={groceryList.map(item => item.name)}
          />
        </div>

        {suggestions.length > 0 && (
          <div className="section">
            <CollapsibleSection title="Smart Suggestions" icon="💡" defaultOpen={true}>
            <div className="suggestions-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    {suggestions.filter(s => s.type === 'missing_item').length} missing items, {' '}
                    {suggestions.filter(s => s.type === 'healthier_alternative').length} healthier alternatives, {' '}
                    {suggestions.filter(s => s.type === 'expiring_reminder').length} expiring reminders
                  </p>
                </div>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    const missingItems = suggestions.filter(s => s.type === 'missing_item' && s.item);
                    for (const suggestion of missingItems) {
                      if (suggestion.item) {
                        await addSuggestedItem(suggestion.item);
                      }
                    }
                    showNotification(`Added ${missingItems.length} suggested items!`, 'success');
                  }}
                >
                  ➕ Add All Missing Items
                </button>
              </div>

              <div className="suggestions-filter">
                <label htmlFor="suggestion-filter" style={{ marginRight: '10px', fontWeight: 600 }}>
                  Filter by Type:
                </label>
                <select
                  id="suggestion-filter"
                  value={suggestionFilter}
                  onChange={(e) => setSuggestionFilter(e.target.value)}
                  className="filter-select"
                  style={{ marginBottom: '15px' }}
                >
                  <option value="all">All Suggestions ({suggestions.length})</option>
                  <option value="missing">Missing Items ({suggestions.filter(s => s.type === 'missing_item').length})</option>
                  <option value="healthier">Healthier Alternatives ({suggestions.filter(s => s.type === 'healthier_alternative').length})</option>
                  <option value="expiring">Expiring Reminders ({suggestions.filter(s => s.type === 'expiring_reminder').length})</option>
                </select>
              </div>

              <div className="suggestions">
                {suggestions
                  .filter(suggestion => {
                    if (suggestionFilter === 'all') return true;
                    if (suggestionFilter === 'missing') return suggestion.type === 'missing_item';
                    if (suggestionFilter === 'healthier') return suggestion.type === 'healthier_alternative';
                    if (suggestionFilter === 'expiring') return suggestion.type === 'expiring_reminder';
                    return true;
                  })
                  .map((suggestion, index) => (
                  <div key={index} className={`suggestion ${suggestion.type.split('_')[0]}`}>
                    <div className="suggestion-message">{suggestion.message}</div>
                    <div className="suggestion-actions">
                      {suggestion.type === 'missing_item' && suggestion.item && (
                        <>
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => addSuggestedItem(suggestion.item!)}
                          >
                            Add to List
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => setSuggestions(suggestions.filter((_, i) => i !== index))}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {suggestion.type === 'healthier_alternative' && suggestion.alternative && suggestion.item && (
                        <>
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => replaceWithAlternative(suggestion.item!, suggestion.alternative!.alternative)}
                          >
                            Replace with {suggestion.alternative.alternative}
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => setSuggestions(suggestions.filter((_, i) => i !== index))}
                          >
                            Keep Original
                          </button>
                        </>
                      )}
                      {suggestion.type === 'expiring_reminder' && (
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setSuggestions(suggestions.filter((_, i) => i !== index))}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
          </div>
        )}

        <div className="section" id="features">
          <h2 className="section-title">📊 CRUD Operations Guide</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Our application provides complete CRUD (Create, Read, Update, Delete) functionality for managing your grocery list.
          </p>
          <div className="crud-guide">
            <div className="crud-item">
              <h3>➕ CREATE</h3>
              <p>Add new items to your grocery list using the form above or chat with the assistant. All items are validated before being added.</p>
            </div>
            <div className="crud-item">
              <h3>📖 READ</h3>
              <p>View all your grocery items in the list. Items show category, purchase date, and expiry information. You can also fetch individual items by ID.</p>
            </div>
            <div className="crud-item">
              <h3>✏️ UPDATE</h3>
              <p>Click the "Edit" button on any item to modify its name, category, or dates. Changes are validated and saved immediately.</p>
            </div>
            <div className="crud-item">
              <h3>🗑️ DELETE</h3>
              <p>Click the "Delete" button to remove items from your list. You'll be asked to confirm before deletion to prevent accidents.</p>
            </div>
          </div>
        </div>
      </div>

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <ChatBot onAddItem={addItem} onGetSuggestions={handleGetSuggestions} />
    </>
  );
}

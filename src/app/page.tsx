'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';
import Assistant from '@/components/Assistant';
import EditItemModal from '@/components/EditItemModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import AssistantPopup, { AssistantMessage, generateAssistantMessage } from '@/components/AssistantPopup';

// Format date as DD/MM/YYYY
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Home() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'pcs' });
  const [stats, setStats] = useState({ total: 0, purchased: 0, pending: 0 });
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [assistantPopup, setAssistantPopup] = useState<{
    message: AssistantMessage | null;
    isVisible: boolean;
    originalItemName?: string; // Track the original item when showing healthier alternatives
  }>({
    message: null,
    isVisible: false,
    originalItemName: undefined
  });


  useEffect(() => {
    loadData();
  }, []);

  const showAssistantPopup = (itemName: string) => {
    const existingItems = groceryList.map(item => item.name);
    const message = generateAssistantMessage('added', itemName, existingItems, '');
    // Store the original item name if it's a healthy alternatives popup
    const originalItemName = message.type === 'healthy' ? itemName : undefined;
    setAssistantPopup({ message, isVisible: true, originalItemName });
  };

  const hideAssistantPopup = () => {
    setAssistantPopup(prev => ({ ...prev, isVisible: false, originalItemName: undefined }));
  };

  const handleAddFromPopup = async (itemName: string) => {
    const originalItemName = assistantPopup.originalItemName;
    const isHealthyAlternative = assistantPopup.message?.type === 'healthy';
    
    hideAssistantPopup();
    
    // If this is a healthier alternative, replace the original item
    if (isHealthyAlternative && originalItemName) {
      // Find and remove the original item
      const originalItem = groceryList.find(item => 
        item.name.toLowerCase() === originalItemName.toLowerCase()
      );
      
      if (originalItem) {
        // Remove the original item first (skip confirmation)
        try {
          const res = await fetch(`/api/grocery-list?id=${originalItem.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            // Update local state immediately
            setGroceryList(prev => prev.filter(item => item.id !== originalItem.id));
            updateStats(groceryList.filter(item => item.id !== originalItem.id));
          }
        } catch (error) {
          console.error('Error removing original item:', error);
        }
      }
    }
    
    // Add the new item (healthier alternative or regular suggestion)
    await addItem(itemName, 1, 'pcs');
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
  const addItem = async (name?: string, quantity?: number, unit?: string) => {
    const itemName = name || newItem.name;
    const itemQuantity = quantity !== undefined ? quantity : (newItem.quantity ? parseFloat(newItem.quantity) : undefined);
    const itemUnit = unit || newItem.unit;
    
    if (!itemName.trim()) {
      alert('Item name is required');
      return;
    }

    try {
      const body: any = { name: itemName };
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
        
        if (!name) {
          setNewItem({ name: '', quantity: '', unit: 'pcs' });
        }
        
        // Update state immediately for instant UI feedback using functional update
        setGroceryList(prev => {
          const updated = [...prev, data.item];
          updateStats(updated);
          return updated;
        });
        
        // Reload data to ensure consistency with server (fire and forget)
        loadData().catch(err => console.error('Error reloading data:', err));
        
        // Show assistant popup with contextual message
        showAssistantPopup(itemName);
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
  const removeItem = async (id: string, skipConfirm = false) => {
    const item = getItem(id);
    if (!item) return;

    if (!skipConfirm) {
      // Show delete confirmation modal
      setItemToDelete(item);
      setIsDeleteModalOpen(true);
      return;
    }

    // Actually delete the item (called from modal confirmation)
    await performDelete(id);
  };

  const performDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/grocery-list?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Reload data to update the list
        await loadData();
      } else {
        const errorData = await res.json();
        console.error(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      console.error('Failed to delete item. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await performDelete(itemToDelete.id);
    }
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const markPurchased = async (id: string) => {
    try {
      const res = await fetch('/api/grocery-list/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        // Reload data to update the list
        await loadData();
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

  const handleRemoveItemByName = async (itemName: string) => {
    // Get fresh data first
    const currentList = [...groceryList];
    const item = currentList.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (item) {
      try {
        const res = await fetch(`/api/grocery-list?id=${item.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await loadData();
          return true;
        }
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      // Try to find partial match
      const partialMatch = currentList.find(i => 
        i.name.toLowerCase().includes(itemName.toLowerCase()) || 
        itemName.toLowerCase().includes(i.name.toLowerCase())
      );
      if (partialMatch) {
        try {
          const res = await fetch(`/api/grocery-list?id=${partialMatch.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            await loadData();
            return true;
          }
        } catch (error) {
          console.error('Error removing item:', error);
        }
      }
    }
    return false;
  };

  const handleGetList = async () => {
    try {
      const res = await fetch('/api/grocery-list');
      if (res.ok) {
        const data = await res.json();
        return (data.list || []).map((item: GroceryItem) => ({
          name: item.name,
          expiryDate: item.expiryDate,
          isExpiring: item.isExpiring,
          isPurchased: item.isPurchased
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching list:', error);
      return [];
    }
  };

  // Filter grocery list based on search and filters
  const filteredList = groceryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !item.isPurchased) ||
      (filterStatus === 'purchased' && item.isPurchased);
    return matchesSearch && matchesStatus;
  });


  return (
    <>
      <header className="header">
        <div className="header-content">
          <nav className="header-tabs">
            <button 
              className={`header-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button 
              className={`header-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('list');
                window.location.href = '/list';
              }}
            >
              List
            </button>
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
            <div className="stat-card-header">
              <div className="stat-label">Total Items</div>
              <div className="stat-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-label">Purchased</div>
              <div className="stat-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.purchased}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-label">Pending</div>
              <div className="stat-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Create - Add New Item</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Item name (e.g., milk, bread, eggs)"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
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
              <span>Add Item</span>
            </button>
          </div>
        </div>

        <div className="section">
          <div className="grocery-list-header">
            <h2 className="section-title" style={{ margin: 0 }}>Your Grocery List</h2>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="purchased">Purchased</option>
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
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grocery-table-container">
              {/* Table Header */}
              <div className="grocery-table-header">
                <div className="col-status">Status</div>
                <div className="col-item">Item</div>
                <div className="col-quantity">Quantity</div>
                <div className="col-actions">Actions</div>
              </div>

              {/* Items List */}
              {filteredList.map((item) => (
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
                      <div className="item-date">
                        Purchased: {formatDate(item.purchasedDate)}
                        {item.expiryDate && ` • Expires: ${formatDate(item.expiryDate)}`}
                      </div>
                    )}
                    {!item.purchasedDate && item.expiryDate && (
                      <div className="item-date">Expires: {formatDate(item.expiryDate)}</div>
                    )}
                  </div>
                  <div className="col-quantity">
                    {item.quantity ? (
                      <span className="quantity-badge">{item.quantity} {item.unit || 'pcs'}</span>
                    ) : (
                      <span className="quantity-na">-</span>
                    )}
                  </div>
                  <div className="col-actions">
                    {!item.isPurchased && (
                      <button
                        className="action-btn purchase"
                        onClick={() => markPurchased(item.id)}
                        title="Mark as purchased"
                      >
                        ✓
                      </button>
                    )}
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
          )}
        </div>

      </div>

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <DeleteConfirmModal
        item={itemToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      <Assistant 
        onAddItem={addItem} 
        onGetSuggestions={handleGetSuggestions}
        onRemoveItem={handleRemoveItemByName}
        onGetList={handleGetList}
        onRefresh={loadData}
        currentListCount={groceryList.length}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';
import GroceryListDisplay from '@/components/GroceryListDisplay';
import EditItemModal from '@/components/EditItemModal';
import Assistant from '@/components/Assistant';

export default function ListPage() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/grocery-list');
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      setGroceryList(data.list || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      const res = await fetch('/api/grocery-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (res.ok) {
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

  const removeItem = async (id: string) => {
    const item = groceryList.find(i => i.id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/grocery-list?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      } else {
        const errorData = await res.json();
        console.error(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
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
        loadData();
      } else {
        console.error('Failed to mark item as purchased');
      }
    } catch (error) {
      console.error('Error marking as purchased:', error);
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

  const handleRemoveItemByName = async (itemName: string) => {
    const item = groceryList.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (item) {
      await removeItem(item.id);
    } else {
      const partialMatch = groceryList.find(i => 
        i.name.toLowerCase().includes(itemName.toLowerCase()) || 
        itemName.toLowerCase().includes(i.name.toLowerCase())
      );
      if (partialMatch) {
        await removeItem(partialMatch.id);
      }
    }
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


  return (
    <>
      <header className="header">
        <div className="header-content">
          <nav className="header-tabs">
            <button 
              className={`header-tab`}
              onClick={() => window.location.href = '/'}
            >
              Home
            </button>
            <button 
              className={`header-tab active`}
            >
              List
            </button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1>Grocery List Management</h1>
          <p className="subtitle">Complete CRUD operations for your grocery items</p>
        </div>

        <div className="stats" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-label">Total Items</div>
              <div className="stat-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{groceryList.length}</div>
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
            <div className="stat-value">{groceryList.filter(i => i.isPurchased).length}</div>
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
            <div className="stat-value">{groceryList.filter(i => !i.isPurchased).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-label">Expiring</div>
              <div className="stat-card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{groceryList.filter(i => i.isExpiring).length}</div>
          </div>
        </div>

        <GroceryListDisplay
          items={groceryList}
          onEdit={handleEdit}
          onDelete={removeItem}
          onMarkPurchased={markPurchased}
          viewMode={viewMode}
        />
      </div>

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <Assistant 
        onAddItem={async (name, quantity, unit) => {
          try {
            const res = await fetch('/api/grocery-list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, quantity, unit })
            });
            if (res.ok) {
              await loadData();
            }
          } catch (error) {
            console.error('Failed to add item', error);
          }
        }} 
        onGetSuggestions={() => {}}
        onRemoveItem={handleRemoveItemByName}
        onGetList={handleGetList}
        onRefresh={loadData}
        currentListCount={groceryList.length}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';
import GroceryListDisplay from '@/components/GroceryListDisplay';
import EditItemModal from '@/components/EditItemModal';
import ChatBot from '@/components/ChatBot';

export default function ListPage() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <>
        <header className="header">
          <div className="header-content">
            <a href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="logo-icon">🛒</div>
              <span>Smart Grocery Assistant</span>
            </a>
            <nav>
              <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/list" style={{ textDecoration: 'underline' }}>List</a></li>
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
      </>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <a href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon">🛒</div>
            <span>Smart Grocery Assistant</span>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="/list" style={{ textDecoration: 'underline' }}>List</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Grocery List Management</h1>
            <p className="subtitle">Complete CRUD operations for your grocery items</p>
          </div>
          <div className="view-toggle">
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              📊 Table View
            </button>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              🎴 Grid View
            </button>
          </div>
        </div>

        <div className="stats" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-value">{groceryList.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groceryList.filter(i => i.isPurchased).length}</div>
            <div className="stat-label">Purchased</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groceryList.filter(i => !i.isPurchased).length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{groceryList.filter(i => i.isExpiring).length}</div>
            <div className="stat-label">Expiring</div>
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

      <ChatBot onAddItem={async (name, category) => {
        try {
          const res = await fetch('/api/grocery-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category })
          });
          if (res.ok) {
            loadData();
          }
        } catch (error) {
          console.error('Failed to add item', error);
        }
      }} onGetSuggestions={() => {}} />
    </>
  );
}

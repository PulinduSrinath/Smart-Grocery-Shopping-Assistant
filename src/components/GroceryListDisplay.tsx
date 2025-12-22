'use client';

import { useState } from 'react';
import { GroceryItem } from '@/types';

interface GroceryListDisplayProps {
  items: GroceryItem[];
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
  onMarkPurchased: (id: string) => void;
  viewMode?: 'table' | 'grid';
}

// Format date as DD/MM/YYYY
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function GroceryListDisplay({
  items,
  onEdit,
  onDelete,
  onMarkPurchased,
  viewMode = 'table'
}: GroceryListDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // Filter and search
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'purchased' && item.isPurchased) ||
      (filterStatus === 'pending' && !item.isPurchased);
    
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        const dateA = a.purchasedDate ? new Date(a.purchasedDate).getTime() : 0;
        const dateB = b.purchasedDate ? new Date(b.purchasedDate).getTime() : 0;
        return dateB - dateA;
      default:
        return 0;
    }
  });

  if (viewMode === 'grid') {
    return (
      <div className="list-display-container">
        <div className="list-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="purchased">Purchased</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <p>Showing {sortedItems.length} of {items.length} items</p>
        </div>

        {sortedItems.length === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">📦</div>
            <p>No items found matching your criteria</p>
          </div>
        ) : (
          <div className="grid-view">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`grid-item ${item.isPurchased ? 'purchased' : ''} ${item.isExpiring ? 'expiring' : ''}`}
              >
                <div className="grid-item-header">
                  <h3>{item.name}</h3>
                </div>
                {item.quantity && (
                  <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                    <strong>Quantity:</strong> {item.quantity} {item.unit || 'pcs'}
                  </div>
                )}
                <div className="grid-item-body">
                  {item.purchasedDate && (
                    <div className="item-detail">
                      <span className="detail-label">Purchased:</span>
                      <span>{formatDate(item.purchasedDate)}</span>
                    </div>
                  )}
                  {item.expiryDate && (
                    <div className="item-detail">
                      <span className="detail-label">Expires:</span>
                      <span>{formatDate(item.expiryDate)}</span>
                    </div>
                  )}
                  {item.isPurchased && (
                    <div className="status-badge purchased-badge">✓ Purchased</div>
                  )}
                </div>
                <div className="grid-item-actions">
                  {!item.isPurchased && (
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => onMarkPurchased(item.id)}
                      title="Mark as purchased"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => onEdit(item)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Table view
  return (
    <div className="list-display-container">
      <div className="list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="purchased">Purchased</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
            className="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      <div className="results-info">
        <p>Showing {sortedItems.length} of {items.length} items</p>
      </div>

      {sortedItems.length === 0 ? (
        <div className="empty-list">
          <div className="empty-icon">📦</div>
          <p>No items found matching your criteria</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="grocery-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Purchased Date</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`table-row ${item.isPurchased ? 'purchased' : ''} ${item.isExpiring ? 'expiring' : ''}`}
                >
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    {item.quantity ? `${item.quantity} ${item.unit || 'pcs'}` : '-'}
                  </td>
                  <td>
                    {item.isPurchased ? (
                      <span className="status-badge purchased-badge">✓ Purchased</span>
                    ) : (
                      <span className="status-badge pending-badge">⏳ Pending</span>
                    )}
                  </td>
                  <td>
                    {item.purchasedDate
                      ? formatDate(item.purchasedDate)
                      : '-'}
                  </td>
                  <td>
                    {item.expiryDate
                      ? formatDate(item.expiryDate)
                      : '-'}
                  </td>
                  <td>
                    <div className="table-actions">
                      {!item.isPurchased && (
                        <button
                          className="action-btn purchase"
                          onClick={() => onMarkPurchased(item.id)}
                          title="Mark as purchased"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => onDelete(item.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


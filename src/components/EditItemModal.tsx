'use client';

import { useState, useEffect } from 'react';
import { GroceryItem } from '@/types';

interface EditItemModalProps {
  item: GroceryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
}

export default function EditItemModal({ item, isOpen, onClose, onSave }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    purchasedDate: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const units = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'bunch', 'bottle', 'box'];

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name,
        quantity: item.quantity?.toString() || '',
        unit: item.unit || 'pcs',
        purchasedDate: item.purchasedDate 
          ? new Date(item.purchasedDate).toISOString().split('T')[0]
          : '',
        expiryDate: item.expiryDate 
          ? new Date(item.expiryDate).toISOString().split('T')[0]
          : ''
      });
      setError('');
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!item) return;

    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<GroceryItem> = {
        name: formData.name.trim()
      };

      if (formData.quantity) {
        const qty = parseFloat(formData.quantity);
        if (!isNaN(qty) && qty > 0) {
          updates.quantity = qty;
          updates.unit = formData.unit;
        }
      }

      if (formData.purchasedDate) {
        updates.purchasedDate = new Date(formData.purchasedDate);
      }

      if (formData.expiryDate) {
        updates.expiryDate = new Date(formData.expiryDate);
      }

      await onSave(item.id, updates);
      onClose();
    } catch (err) {
      setError('Failed to update item. Please try again.');
      console.error('Error updating item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Grocery Item</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter item name"
            />
          </div>

          <div className="form-group-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 2"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purchasedDate">Purchased Date</label>
            <input
              type="date"
              id="purchasedDate"
              value={formData.purchasedDate}
              onChange={(e) => setFormData({ ...formData, purchasedDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { GroceryItem } from '@/types';

interface DeleteConfirmModalProps {
  item: GroceryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ item, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Item</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '12px' }}>
              Are you sure you want to delete <strong style={{ color: '#dc2626' }}>"{item.name}"</strong>?
            </p>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              This action cannot be undone.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


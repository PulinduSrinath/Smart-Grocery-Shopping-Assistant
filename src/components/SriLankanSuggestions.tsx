'use client';

import { useState } from 'react';
import { SRI_LANKAN_ESSENTIALS } from '@/lib/rules';
import CollapsibleSection from './CollapsibleSection';

interface SriLankanSuggestionsProps {
  onAddItem: (name: string, quantity?: number, unit?: string) => void;
  currentItems: string[];
}

export default function SriLankanSuggestions({ onAddItem, currentItems }: SriLankanSuggestionsProps) {
  const availableItems = SRI_LANKAN_ESSENTIALS.filter(
    item => !currentItems.some(current => 
      current.toLowerCase().includes(item.name.toLowerCase()) ||
      item.name.toLowerCase().includes(current.toLowerCase())
    )
  );

  if (availableItems.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection title="Sri Lankan Cultural Food Suggestions" icon="🇱🇰" defaultOpen={true}>
      <div className="sri-lankan-suggestions-content">
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Essential Sri Lankan ingredients for authentic cooking. Click to add to your list.
        </p>
        
        <div className="sri-lankan-controls">
          <button
            className="btn btn-success"
            onClick={() => {
              availableItems.forEach(item => {
                onAddItem(item.name, 1, 'pcs');
              });
            }}
          >
            ➕ Add All ({availableItems.length} items)
          </button>
        </div>

        <div className="sri-lankan-grid">
          {availableItems.length === 0 ? (
            <div className="empty-list">
              <p>No items available</p>
            </div>
          ) : (
            availableItems.map((item, index) => (
              <div key={index} className="sri-lankan-item">
                <div className="sri-lankan-content">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onAddItem(item.name, 1, 'pcs')}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}

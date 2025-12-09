'use client';

import { useState } from 'react';
import { SRI_LANKAN_ESSENTIALS } from '@/lib/rules';
import CollapsibleSection from './CollapsibleSection';

interface SriLankanSuggestionsProps {
  onAddItem: (name: string, category: string, quantity?: number, unit?: string) => void;
  currentItems: string[];
}

export default function SriLankanSuggestions({ onAddItem, currentItems }: SriLankanSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const availableItems = SRI_LANKAN_ESSENTIALS.filter(
    item => !currentItems.some(current => 
      current.toLowerCase().includes(item.name.toLowerCase()) ||
      item.name.toLowerCase().includes(current.toLowerCase())
    )
  );

  const categories = ['all', ...Array.from(new Set(availableItems.map(item => item.category)))];
  
  const filteredItems = selectedCategory === 'all' 
    ? availableItems 
    : availableItems.filter(item => item.category === selectedCategory);

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
          <div className="filter-control">
            <label htmlFor="sri-lankan-category" style={{ marginRight: '10px', fontWeight: 600 }}>
              Filter by Category:
            </label>
            <select
              id="sri-lankan-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-success"
            onClick={() => {
              filteredItems.forEach(item => {
                onAddItem(item.name, item.category, 1, 'pcs');
              });
            }}
          >
            ➕ Add All ({filteredItems.length} items)
          </button>
        </div>

        <div className="sri-lankan-grid">
          {filteredItems.length === 0 ? (
            <div className="empty-list">
              <p>No items available in this category</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={index} className="sri-lankan-item">
                <div className="sri-lankan-content">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <span className={`category-badge category-${item.category}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                    {item.category}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onAddItem(item.name, item.category, 1, 'pcs')}
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

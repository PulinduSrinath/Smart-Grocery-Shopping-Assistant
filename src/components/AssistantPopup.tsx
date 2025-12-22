'use client';

import React from 'react';
import Image from 'next/image';
import assistantImage from '@/app/images/assistant.webp';

export interface AssistantMessage {
  id: string;
  type: 'duplicate' | 'added' | 'suggestion' | 'healthy' | 'expiring' | 'info';
  title: string;
  message: string;
  itemName?: string;
  suggestions?: string[];
  onAction?: (action: string) => void;
}

interface AssistantPopupProps {
  message: AssistantMessage | null;
  isVisible: boolean;
  onClose: () => void;
  onAddSuggestion?: (item: string) => void;
}

export default function AssistantPopup({ 
  message, 
  isVisible, 
  onClose,
  onAddSuggestion
}: AssistantPopupProps) {
  if (!isVisible || !message) return null;

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'duplicate': return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      case 'added': return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
      case 'suggestion': return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
      case 'healthy': return 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      case 'expiring': return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      default: return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
      case 'duplicate': return '#f59e0b';
      case 'added': return '#10b981';
      case 'suggestion': return '#3b82f6';
      case 'healthy': return '#22c55e';
      case 'expiring': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getEmoji = () => {
    switch (message.type) {
      case 'duplicate': return '⚠️';
      case 'added': return '✅';
      case 'suggestion': return '💡';
      case 'healthy': return '🥗';
      case 'expiring': return '⏰';
      default: return '📢';
    }
  };

  return (
    <div className="assistant-popup-overlay" onClick={onClose}>
      <div 
        className="assistant-popup"
        style={{ 
          background: getBackgroundColor(),
          borderColor: getBorderColor()
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="assistant-popup-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="assistant-popup-content">
          <div className="assistant-image-container">
            <Image
              src={assistantImage}
              alt="Smart Assistant"
              width={80}
              height={80}
              className="assistant-image"
              priority
            />
            <div className="assistant-status-dot"></div>
          </div>

          <div className="assistant-message-content">
            <div className="assistant-header">
              <span className="assistant-emoji">{getEmoji()}</span>
              <h3 className="assistant-title">{message.title}</h3>
            </div>
            
            <p className="assistant-message">{message.message}</p>

            {message.suggestions && message.suggestions.length > 0 && (
              <div className="assistant-suggestions">
                <p className="suggestions-label">You might also need:</p>
                <div className="suggestion-chips">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => onAddSuggestion && onAddSuggestion(suggestion)}
                    >
                      <span>+</span> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {message.type === 'healthy' && message.suggestions && message.suggestions.length > 0 && (
              <div className="assistant-healthy-tips">
                <p className="healthy-label">🌿 Healthier alternatives:</p>
                <div className="healthy-chips">
                  {message.suggestions.map((alt, index) => (
                    <button
                      key={index}
                      className="healthy-chip"
                      onClick={() => onAddSuggestion && onAddSuggestion(alt)}
                    >
                      <span>🔄</span> {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="assistant-popup-footer">
          <div className="assistant-wave">
            <span>👋</span> I'm here to help!
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate assistant messages
export function generateAssistantMessage(
  type: AssistantMessage['type'],
  itemName: string,
  existingItems: string[] = [],
  category?: string
): AssistantMessage {
  const relatedItems: Record<string, string[]> = {
    'milk': ['bread', 'eggs', 'butter', 'cheese'],
    'bread': ['butter', 'jam', 'eggs', 'milk'],
    'rice': ['dhal', 'coconut', 'curry leaves', 'turmeric'],
    'eggs': ['bread', 'butter', 'milk', 'cheese'],
    'chicken': ['rice', 'vegetables', 'spices', 'coconut milk'],
    'fish': ['rice', 'lime', 'curry leaves', 'coconut'],
    'vegetables': ['rice', 'dhal', 'coconut oil', 'spices'],
    'fruits': ['yogurt', 'honey', 'nuts'],
    'coconut': ['rice', 'curry leaves', 'turmeric', 'dhal'],
    'dhal': ['rice', 'coconut', 'curry leaves', 'onions'],
  };

  const healthyAlternatives: Record<string, string[]> = {
    'white bread': ['brown bread', 'whole grain bread', 'multigrain bread'],
    'bread': ['brown bread', 'whole grain bread'],
    'white rice': ['red rice', 'brown rice', 'quinoa'],
    'rice': ['red rice', 'samba rice', 'brown rice'],
    'soda': ['king coconut', 'fresh juice', 'sparkling water'],
    'sugar': ['honey', 'kithul jaggery', 'stevia'],
    'butter': ['coconut oil', 'olive oil', 'avocado'],
    'chips': ['roasted nuts', 'vegetable chips', 'popcorn'],
    'ice cream': ['frozen yogurt', 'fruit sorbet', 'coconut ice cream'],
    'milk': ['almond milk', 'coconut milk', 'oat milk'],
  };

  const itemLower = itemName.toLowerCase();
  const id = `msg-${Date.now()}`;

  // Check for duplicates
  const isDuplicate = existingItems.some(
    item => item.toLowerCase() === itemLower
  );

  if (isDuplicate) {
    return {
      id,
      type: 'duplicate',
      title: 'Already in your list!',
      message: `You already have "${itemName}" in your grocery list. Would you like to increase the quantity instead?`,
      itemName,
    };
  }

  // Get related suggestions
  let suggestions: string[] = [];
  for (const [key, related] of Object.entries(relatedItems)) {
    if (itemLower.includes(key) || key.includes(itemLower)) {
      suggestions = related.filter(
        r => !existingItems.some(e => e.toLowerCase().includes(r.toLowerCase()))
      ).slice(0, 3);
      break;
    }
  }

  // Check for healthy alternatives
  let healthyOptions: string[] = [];
  for (const [key, alternatives] of Object.entries(healthyAlternatives)) {
    if (itemLower.includes(key) || key.includes(itemLower)) {
      healthyOptions = alternatives.slice(0, 2);
      break;
    }
  }

  if (healthyOptions.length > 0) {
    return {
      id,
      type: 'healthy',
      title: 'Great choice! 🌟',
      message: `I've added "${itemName}" to your list. Did you know there are healthier alternatives you might want to consider?`,
      itemName,
      suggestions: healthyOptions,
    };
  }

  if (suggestions.length > 0) {
    return {
      id,
      type: 'suggestion',
      title: 'Added successfully! 🎉',
      message: `"${itemName}" is now in your list. Based on your shopping patterns, you might also need these items:`,
      itemName,
      suggestions,
    };
  }

  return {
    id,
    type: 'added',
    title: 'Added to list! ✨',
    message: `"${itemName}" has been added to your grocery list. I'll keep track of it and remind you when it might be running low!`,
    itemName,
  };
}


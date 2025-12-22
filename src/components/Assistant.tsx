'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import assistantImage from '@/app/images/assistant.webp';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AssistantProps {
  onAddItem?: (name: string, quantity?: number, unit?: string) => Promise<void> | void;
  onGetSuggestions?: () => void;
  onRemoveItem?: (name: string) => Promise<boolean | void> | boolean | void;
  onGetList?: () => Promise<Array<{ name: string; expiryDate?: Date; isExpiring?: boolean; isPurchased: boolean }>>;
  onRefresh?: () => void;
  currentListCount?: number;
}

export default function Assistant({ onAddItem, onGetSuggestions, onRemoveItem, onGetList, onRefresh, currentListCount = 0 }: AssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Smart Grocery Assistant. I can help you:\n\nAdd items: \"add milk\"\nRemove items: \"remove milk\"\nView list: \"list\"\nGet suggestions: \"suggest\"\nCheck reminders: \"reminders\"\nHealthier options: \"healthier\"\nExpiration info: \"expire milk\"\n\nType \"help\" for all commands!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [listCount, setListCount] = useState(currentListCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setListCount(currentListCount);
  }, [currentListCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const healthierAlternatives: Record<string, { alternative: string; reason: string }> = {
    'white bread': { alternative: 'brown bread or whole grain bread', reason: 'More fiber and nutrients' },
    'bread': { alternative: 'brown bread or whole grain bread', reason: 'More fiber and nutrients' },
    'white rice': { alternative: 'red rice or brown rice', reason: 'Lower glycemic index, more fiber' },
    'rice': { alternative: 'red rice or brown rice', reason: 'Lower glycemic index, more fiber' },
    'soda': { alternative: 'fresh fruit juice or coconut water', reason: 'No added sugar, natural vitamins' },
    'cola': { alternative: 'sparkling water or lime juice', reason: 'No caffeine, no sugar' },
    'sugar': { alternative: 'honey or jaggery', reason: 'Natural sweeteners with minerals' },
    'butter': { alternative: 'coconut oil or olive oil', reason: 'Healthier fats' },
    'chips': { alternative: 'roasted nuts or popcorn', reason: 'More protein, less oil' },
    'ice cream': { alternative: 'frozen yogurt or fruit sorbet', reason: 'Less fat, probiotics' },
    'milk': { alternative: 'low-fat milk or almond milk', reason: 'Less saturated fat' },
  };

  const generateResponse = async (userInput: string): Promise<{ text: string; action?: () => void }> => {
    const lowerInput = userInput.toLowerCase().trim();

    // Remove/Delete item commands
    if (lowerInput.startsWith('remove ') || lowerInput.startsWith('delete ')) {
      const itemName = lowerInput.replace(/^(remove|delete)\s+/i, '').trim();
      if (itemName.length > 0 && onRemoveItem) {
        return {
          text: `Removing "${itemName}" from your list...`,
          action: async () => {
            try {
              await onRemoveItem(itemName);
              if (onRefresh) {
                setTimeout(() => {
                  onRefresh();
                }, 500);
              }
            } catch (error) {
              console.error('Error removing item:', error);
            }
          }
        };
      } else if (itemName.length === 0) {
        return {
          text: `Please specify which item to remove. Example: "remove milk" or "delete bread"`
        };
      }
    }

    // List/Show list commands
    if (lowerInput === 'list' || lowerInput === 'show list' || lowerInput === 'show my list') {
      if (onGetList) {
        try {
          const list = await onGetList();
          if (list.length === 0) {
            return {
              text: `Your grocery list is empty. Add some items to get started!\n\nTry: "add milk" or "add bread"`
            };
          }
          
          const purchased = list.filter(item => item.isPurchased);
          const pending = list.filter(item => !item.isPurchased);
          const expiring = list.filter(item => item.isExpiring);
          
          let listText = `Your Grocery List (${list.length} items):\n\n`;
          
          if (pending.length > 0) {
            listText += `Pending (${pending.length}):\n`;
            pending.forEach(item => {
              listText += `  • ${item.name}`;
              if (item.expiryDate) {
                const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                listText += ` (expires in ${daysUntilExpiry} days)`;
              }
              listText += '\n';
            });
            listText += '\n';
          }
          
          if (expiring.length > 0) {
            listText += `Expiring Soon:\n`;
            expiring.forEach(item => {
              listText += `  • ${item.name}`;
              if (item.expiryDate) {
                const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                listText += ` (expires in ${daysUntilExpiry} days)`;
              }
              listText += '\n';
            });
            listText += '\n';
          }
          
          if (purchased.length > 0) {
            listText += `Purchased (${purchased.length}):\n`;
            purchased.slice(0, 5).forEach(item => {
              listText += `  • ${item.name}\n`;
            });
            if (purchased.length > 5) {
              listText += `  ... and ${purchased.length - 5} more\n`;
            }
          }
          
          return { text: listText };
        } catch (error) {
          return {
            text: `Sorry, I couldn't load your list. Please try again.`
          };
        }
      }
      return {
        text: `You have ${listCount} items in your list. Use the grocery list above to see details.`
      };
    }

    // Expire [item] command
    if (lowerInput.startsWith('expire ')) {
      const itemName = lowerInput.replace(/^expire\s+/i, '').trim();
      
      if (itemName.length === 0) {
        return {
          text: `Please specify an item. Example: "expire rice" or "expire milk"`
        };
      }
      
      // Check if item exists in the list
      if (onGetList) {
        try {
          const list = await onGetList();
          const item = list.find(i => 
            i.name.toLowerCase() === itemName.toLowerCase() || 
            i.name.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(i.name.toLowerCase())
          );
          
          if (item && item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let statusText = '';
            if (daysUntilExpiry < 0) {
              statusText = `⚠️ EXPIRED ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago`;
            } else if (daysUntilExpiry === 0) {
              statusText = `⚠️ Expires TODAY`;
            } else if (daysUntilExpiry <= 3) {
              statusText = `⚠️ Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} (soon!)`;
            } else {
              statusText = `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
            }
            
            // Format date as DD/MM/YYYY
            const formattedDate = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;
            return {
              text: `Expiration info for "${item.name}":\n\n${statusText}\nExpiry Date: ${formattedDate}\n\n${item.isPurchased ? 'Status: Purchased' : 'Status: Not purchased yet'}`
            };
          } else if (item) {
            // Item exists but no expiry date set
            const generalInfo: Record<string, string> = {
              'rice': 'White rice: 1-2 years (uncooked), 3-4 days (cooked)\nBrown rice: 6 months (uncooked), 3-4 days (cooked)',
              'milk': '5-7 days (refrigerated)',
              'bread': '5-7 days',
              'eggs': '3-4 weeks (refrigerated)',
              'vegetables': '3-7 days',
              'fruits': '5-10 days',
              'meat': '2-3 days (refrigerated)',
              'chicken': '2-3 days (refrigerated)',
              'fish': '1-2 days (refrigerated)',
              'cheese': '1-2 weeks (refrigerated)',
              'yogurt': '7-14 days (refrigerated)',
            };
            
            let info = '';
            for (const [key, value] of Object.entries(generalInfo)) {
              if (itemName.toLowerCase().includes(key) || item.name.toLowerCase().includes(key)) {
                info = value;
                break;
              }
            }
            
            if (!info) {
              info = 'General guidelines: Check the expiration date on the package. Store properly and use within recommended timeframes.';
            }
            
            return {
              text: `Expiration info for "${item.name}":\n\nNo expiry date set for this item.\n\nGeneral guidelines:\n${info}\n\nTip: You can set an expiry date when adding items to track expiration better!`
            };
          }
        } catch (error) {
          console.error('Error getting list:', error);
        }
      }
      
      // Item not in list - show general guidelines
      const generalInfo: Record<string, string> = {
        'rice': 'White rice: 1-2 years (uncooked), 3-4 days (cooked)\nBrown rice: 6 months (uncooked), 3-4 days (cooked)',
        'milk': '5-7 days (refrigerated)',
        'bread': '5-7 days',
        'eggs': '3-4 weeks (refrigerated)',
        'vegetables': '3-7 days',
        'fruits': '5-10 days',
        'meat': '2-3 days (refrigerated)',
        'chicken': '2-3 days (refrigerated)',
        'fish': '1-2 days (refrigerated)',
        'cheese': '1-2 weeks (refrigerated)',
        'yogurt': '7-14 days (refrigerated)',
      };
      
      for (const [key, value] of Object.entries(generalInfo)) {
        if (itemName.toLowerCase().includes(key)) {
          return {
            text: `Expiration info for "${itemName}":\n\n${value}\n\nTip: Add this item to your list to track its expiration date!`
          };
        }
      }
      
      return {
        text: `General expiration guidelines:\n\nDairy: 5-7 days\nBread: 5-7 days\nVegetables: 3-7 days\nFruits: 5-10 days\nMeat: 2-3 days (refrigerated)\nEggs: 3-4 weeks\nRice: 1-2 years (uncooked), 3-4 days (cooked)\n\nFor "${itemName}", check the expiration date on the package. Add it to your list to track expiration!`
      };
    }

    // Healthier [item] command
    if (lowerInput.startsWith('healthier ')) {
      const itemName = lowerInput.replace(/^healthier\s+/i, '').trim();
      if (itemName.length > 0) {
        for (const [key, value] of Object.entries(healthierAlternatives)) {
          if (itemName.toLowerCase().includes(key)) {
            return {
              text: `Healthier alternative for "${itemName}":\n\n${value.alternative}\n\nWhy: ${value.reason}\n\nWould you like to add this instead?`
            };
          }
        }
        return {
          text: `I don't have a specific alternative for "${itemName}" yet, but here are general tips:\n\n• Choose whole grains over refined\n• Opt for fresh over processed\n• Look for items with fewer additives\n• Consider organic options when possible`
        };
      }
    }

    // Healthier (all items) command
    if (lowerInput === 'healthier' || lowerInput === 'healthier alternatives') {
      const alternatives = Object.entries(healthierAlternatives)
        .map(([item, alt]) => `• ${item} → ${alt.alternative} (${alt.reason})`)
        .join('\n');
      
      return {
        text: `Healthier alternatives for common items:\n\n${alternatives}\n\nAsk "healthier [item]" for specific suggestions!`
      };
    }

    // Reminders/Expiring command
    if (lowerInput === 'reminders' || lowerInput === 'expiring' || lowerInput === 'expiring items') {
      if (onGetList) {
        try {
          const list = await onGetList();
          const expiring = list.filter(item => item.isExpiring && !item.isPurchased);
          
          if (expiring.length === 0) {
            return {
              text: `Great news! No items are expiring soon. All your groceries are fresh!`
            };
          }
          
          let reminderText = `Expiration Reminders (${expiring.length} items):\n\n`;
          expiring.forEach(item => {
            reminderText += `• ${item.name}`;
            if (item.expiryDate) {
              const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              reminderText += ` - expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
            }
            reminderText += '\n';
          });
          reminderText += '\nUse these items soon to avoid waste!';
          
          return { text: reminderText };
        } catch (error) {
          return {
            text: `Check your grocery list above for expiration reminders. Items marked as expiring are expiring soon!`
          };
        }
      }
      return {
        text: `Check your grocery list above for expiration reminders. Items marked as expiring are expiring soon!`
      };
    }

    // Add item commands
    if (lowerInput.includes('add') || lowerInput.includes('buy') || lowerInput.includes('get') || lowerInput.includes('need')) {
      // Parse quantity: "add 2kg rice" or "add 2 kg rice" or "add rice 2kg"
      const quantityMatch = userInput.match(/(\d+(?:\.\d+)?)\s*(kg|g|L|ml|pcs|pack|bunch|bottle|box|loaf)?/i);
      const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
      const unit = quantityMatch?.[2]?.toLowerCase() || 'pcs';

      // Extract item name
      let itemName = userInput
        .replace(/^(add|buy|get|i need|please add|can you add)\s+/i, '')
        .replace(/(\d+(?:\.\d+)?)\s*(kg|g|L|ml|pcs|pack|bunch|bottle|box|loaf)?\s*/gi, '')
        .replace(/\s+to\s+(my\s+)?list.*$/i, '')
        .replace(/\s+please.*$/i, '')
        .trim();

      if (itemName.length > 0) {
        // Check for healthier alternatives
        let healthTip = '';
        for (const [key, value] of Object.entries(healthierAlternatives)) {
          if (itemName.toLowerCase().includes(key)) {
            healthTip = `\n\nHealthy tip: Consider ${value.alternative} instead - ${value.reason}!`;
            break;
          }
        }

        return {
          text: `Added "${itemName}" (${quantity} ${unit}) to your list!${healthTip}`,
          action: async () => {
            if (onAddItem) {
              try {
                await onAddItem(itemName, quantity, unit);
                // onAddItem already calls loadData() which updates the UI
              } catch (error) {
                console.error('Error adding item:', error);
              }
            }
          }
        };
      } else {
        return {
          text: `Please specify an item name. Example: "add milk" or "add 2kg rice"`
        };
      }
    }

    // Healthier alternatives
    if (lowerInput.includes('health') || lowerInput.includes('alternative') || lowerInput.includes('better option')) {
      const alternatives = Object.entries(healthierAlternatives)
        .slice(0, 5)
        .map(([item, alt]) => `• ${item} → ${alt.alternative}`)
        .join('\n');
      
      return {
        text: `Here are some healthier alternatives:\n\n${alternatives}\n\nAsk me about any specific item for more suggestions!`
      };
    }

    // Suggestions
    if (lowerInput.includes('suggest') || lowerInput.includes('recommend') || lowerInput.includes('what should')) {
      if (onGetSuggestions) {
        onGetSuggestions();
        if (onRefresh) {
          setTimeout(() => onRefresh(), 500);
        }
      }
      return {
        text: `Based on common shopping patterns, you might need:\n\nDairy: Milk, Eggs, Butter\nBread: Bread, Roti\nVegetables: Onions, Tomatoes, Potatoes\nFruits: Bananas, Apples\nStaples: Rice, Dhal, Oil\n\nYou have ${listCount} items in your list. Would you like me to add any of these?\n\nTry: "add milk" or "add bread"`
      };
    }

    // Expiring items
    if (lowerInput.includes('expir') || lowerInput.includes('spoil') || lowerInput.includes('fresh')) {
      return {
        text: `Typical shelf life for groceries:\n\nMilk: 5-7 days\nBread: 5-7 days\nVegetables: 3-7 days\nFruits: 5-10 days\nMeat: 2-3 days (refrigerated)\nEggs: 3-4 weeks\n\nI'll remind you when items might be expiring!`
      };
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput === '?') {
      return {
        text: `Available Commands:\n\n• add [item] — Adds an item and suggests healthier alternatives\n• remove [item] / delete [item] — Removes an item\n• list / show list — Shows the grocery list with expiration info\n• suggest / suggestions — Suggests missing items based on purchase history\n• reminders / expiring — Shows expiration reminders\n• healthier [item] — Shows healthier alternatives for a specific item\n• healthier — Shows alternatives for all items in the list\n• expire [item] — Shows expiration information for an item\n• help — Shows available commands`
      };
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|good morning|good evening)/)) {
      return {
        text: `Hello! Great to see you! You have ${listCount} items in your list.\n\nHow can I help you today? You can:\n• Add items: "add milk"\n• Get suggestions: "suggest items"\n• Ask for healthy options`
      };
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return {
        text: `You're welcome! Happy to help with your grocery shopping. Let me know if you need anything else!`
      };
    }

    // Clear/Remove
    if (lowerInput.includes('clear') || lowerInput.includes('remove all') || lowerInput.includes('delete all')) {
      return {
        text: `To manage your list, please use the grocery list above where you can:\n• Edit individual items\n• Delete items\n• Mark as purchased`
      };
    }

    // Default response
    return {
      text: `I understand you said: "${userInput}"\n\nI can help you with:\n• Adding items: "add [item]"\n• Suggestions: "suggest items"\n• Healthy options: "healthier alternatives"\n\nOr type "help" for more options!`
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const response = await generateResponse(userInput);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);

    // Execute action if any
    if (response.action) {
      // Execute action immediately for better UX
      response.action();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "Add milk", action: "add milk" },
    { label: "Add bread", action: "add bread" },
    { label: "Suggestions", action: "suggest items" },
    { label: "Healthy options", action: "healthier alternatives" },
  ];

  return (
    <>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-icon-button"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-avatar">
                <Image src={assistantImage} alt="Assistant" width={40} height={40} />
              </div>
              <div>
                <h3>Grocery Assistant</h3>
                <p>{listCount} items in your list</p>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-bar">
            {quickActions.map((qa, index) => (
              <button
                key={index}
                onClick={() => setInput(qa.action)}
                className="quick-action-chip"
              >
                {qa.label}
              </button>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (e.g., 'add milk')"
              className="chat-input"
            />
            <button 
              onClick={handleSend} 
              className="chat-send-button" 
              disabled={!input.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}


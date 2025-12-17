'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  onAddItem?: (name: string, category: string, quantity?: number, unit?: string) => void;
  onGetSuggestions?: () => void;
  currentListCount?: number;
}

export default function ChatBot({ onAddItem, onGetSuggestions, currentListCount = 0 }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! 👋 I'm your Smart Grocery Assistant. I can help you:\n\n🛒 Add items to your list\n💡 Suggest items you might need\n🥗 Recommend healthier alternatives\n⏰ Track expiring products\n\nTry saying \"add milk\" or \"suggest items\"!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectCategory = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter') || name.includes('curd') || name.includes('eggs') || name.includes('egg')) return 'dairy';
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish') || name.includes('meat') || name.includes('prawns')) return 'meat';
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('mango') || name.includes('grape') || name.includes('fruit')) return 'fruits';
    if (name.includes('carrot') || name.includes('tomato') || name.includes('onion') || name.includes('potato') || name.includes('vegetable') || name.includes('cabbage') || name.includes('spinach')) return 'vegetables';
    if (name.includes('bread') || name.includes('roti') || name.includes('naan') || name.includes('bun')) return 'bread';
    if (name.includes('water') || name.includes('juice') || name.includes('soda') || name.includes('tea') || name.includes('coffee') || name.includes('drink')) return 'beverages';
    if (name.includes('chip') || name.includes('biscuit') || name.includes('cookie') || name.includes('snack') || name.includes('chocolate')) return 'snacks';
    return 'other';
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

  const generateResponse = (userInput: string): { text: string; action?: () => void } => {
    const lowerInput = userInput.toLowerCase().trim();

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
        const category = detectCategory(itemName);
        
        // Check for healthier alternatives
        let healthTip = '';
        for (const [key, value] of Object.entries(healthierAlternatives)) {
          if (itemName.toLowerCase().includes(key)) {
            healthTip = `\n\n💡 Healthy tip: Consider ${value.alternative} instead - ${value.reason}!`;
            break;
          }
        }

        return {
          text: `✅ Added "${itemName}" (${quantity} ${unit}) to your list!\n\nCategory: ${category}${healthTip}`,
          action: () => {
            if (onAddItem) {
              onAddItem(itemName, category, quantity, unit);
            }
          }
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
        text: `🥗 Here are some healthier alternatives:\n\n${alternatives}\n\nAsk me about any specific item for more suggestions!`
      };
    }

    // Suggestions
    if (lowerInput.includes('suggest') || lowerInput.includes('recommend') || lowerInput.includes('what should')) {
      if (onGetSuggestions) onGetSuggestions();
      return {
        text: `💡 Based on common shopping patterns, you might need:\n\n🥛 Dairy: Milk, Eggs, Butter\n🍞 Bread: Bread, Roti\n🥬 Vegetables: Onions, Tomatoes, Potatoes\n🍎 Fruits: Bananas, Apples\n🌾 Staples: Rice, Dhal, Oil\n\nYou have ${currentListCount} items in your list. Would you like me to add any of these?`
      };
    }

    // Expiring items
    if (lowerInput.includes('expir') || lowerInput.includes('spoil') || lowerInput.includes('fresh')) {
      return {
        text: `⏰ Typical shelf life for groceries:\n\n🥛 Milk: 5-7 days\n🍞 Bread: 5-7 days\n🥬 Vegetables: 3-7 days\n🍎 Fruits: 5-10 days\n🥩 Meat: 2-3 days (refrigerated)\n🥚 Eggs: 3-4 weeks\n\nI'll remind you when items might be expiring!`
      };
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput === '?') {
      return {
        text: `🤖 I'm your Grocery Assistant! Here's what I can do:\n\n📝 **Add Items:**\n• "add milk"\n• "add 2kg rice"\n• "buy eggs"\n\n💡 **Get Suggestions:**\n• "suggest items"\n• "what should I buy?"\n\n🥗 **Healthy Options:**\n• "healthier alternatives"\n• "better option for bread"\n\n⏰ **Expiry Info:**\n• "when does milk expire?"\n\nJust chat naturally with me!`
      };
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|good morning|good evening)/)) {
      return {
        text: `Hello! 👋 Great to see you! You have ${currentListCount} items in your list.\n\nHow can I help you today? You can:\n• Add items: "add milk"\n• Get suggestions: "suggest items"\n• Ask for healthy options`
      };
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return {
        text: `You're welcome! 😊 Happy to help with your grocery shopping. Let me know if you need anything else!`
      };
    }

    // Clear/Remove
    if (lowerInput.includes('clear') || lowerInput.includes('remove all') || lowerInput.includes('delete all')) {
      return {
        text: `⚠️ To manage your list, please use the grocery list above where you can:\n• ✏️ Edit individual items\n• 🗑️ Delete items\n• ✓ Mark as purchased`
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

    const response = generateResponse(userInput);
    
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
      setTimeout(() => response.action!(), 300);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "🥛 Add milk", action: "add milk" },
    { label: "🍞 Add bread", action: "add bread" },
    { label: "💡 Suggestions", action: "suggest items" },
    { label: "🥗 Healthy options", action: "healthier alternatives" },
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div>
                <h3>Grocery Assistant</h3>
                <p>{currentListCount} items in your list</p>
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

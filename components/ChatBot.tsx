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
}

export default function ChatBot({ onAddItem, onGetSuggestions }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Smart Grocery Shopping Assistant. I can help you manage your grocery list, suggest items, and provide healthier alternatives. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setInput('');

    // Process the message and generate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Execute action if needed
      if (botResponse.action) {
        botResponse.action();
      }
    }, 500);
  };

  const generateBotResponse = (userInput: string): { text: string; action?: () => void } => {
    const lowerInput = userInput.toLowerCase();

    // Add item commands
    if (lowerInput.includes('add') || lowerInput.includes('buy') || lowerInput.includes('get')) {
      // Try to match quantity patterns like "add 2 kg rice" or "add rice 2kg"
      const quantityMatch = userInput.match(/(?:add|buy|get)\s+(\d+(?:\.\d+)?)\s*(kg|g|L|mL|pcs|pack|bunch|bottle|box)?\s+(.+?)(?:\s+to|$)/i) ||
                           userInput.match(/(?:add|buy|get)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|L|mL|pcs|pack|bunch|bottle|box)?(?:\s+to|$)/i);
      
      if (quantityMatch) {
        const quantity = parseFloat(quantityMatch[1] || quantityMatch[2]);
        const unit = (quantityMatch[2] || quantityMatch[3] || 'pcs').toLowerCase();
        const itemName = (quantityMatch[3] || quantityMatch[1]).trim();
        const category = detectCategory(itemName);
        
        if (onAddItem && !isNaN(quantity)) {
          onAddItem(itemName, category, quantity, unit);
        }
        
        return {
          text: `I've added "${itemName}" (${quantity} ${unit}) to your grocery list under the ${category} category. Would you like me to suggest any healthier alternatives?`,
          action: () => {
            setTimeout(() => {
              if (onGetSuggestions) onGetSuggestions();
            }, 1000);
          }
        };
      }
      
      // Regular add without quantity
      const itemMatch = userInput.match(/(?:add|buy|get)\s+(.+?)(?:\s+to|$)/i);
      if (itemMatch) {
        const itemName = itemMatch[1].trim();
        const category = detectCategory(itemName);
        
        if (onAddItem) {
          onAddItem(itemName, category, 1, 'pcs');
        }
        
        return {
          text: `I've added "${itemName}" to your grocery list under the ${category} category. Would you like me to suggest any healthier alternatives?`,
          action: () => {
            setTimeout(() => {
              if (onGetSuggestions) onGetSuggestions();
            }, 1000);
          }
        };
      }
    }

    // Show suggestions
    if (lowerInput.includes('suggest') || lowerInput.includes('recommend') || lowerInput.includes('what should i buy')) {
      if (onGetSuggestions) {
        onGetSuggestions();
      }
      return {
        text: "I've analyzed your purchase history and current list. Check the suggestions section above for missing items, healthier alternatives, and expiring items!"
      };
    }

    // Help commands
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return {
        text: "I can help you with:\n\n• Adding items to your list (e.g., 'add milk')\n• Suggesting missing items based on your history\n• Recommending healthier alternatives\n• Reminding you about expiring items\n• Answering questions about your grocery list\n\nJust tell me what you need!"
      };
    }

    // List commands
    if (lowerInput.includes('list') || lowerInput.includes('show') || lowerInput.includes('what')) {
      return {
        text: "Your grocery list is displayed above. You can add items, mark them as purchased, or ask me to suggest items you might be missing!"
      };
    }

    // Healthier alternatives
    if (lowerInput.includes('health') || lowerInput.includes('healthy') || lowerInput.includes('alternative')) {
      return {
        text: "I can suggest healthier alternatives for items in your list. For example, I might suggest brown bread instead of white bread, or sparkling water instead of soda. Check the suggestions section for recommendations!"
      };
    }

    // Greetings
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return {
        text: "Hello! I'm here to help you with your grocery shopping. You can ask me to add items, get suggestions, or help with anything related to your grocery list!"
      };
    }

    // Default response
    return {
      text: "I understand you're asking about: '" + userInput + "'. I can help you add items to your list, get suggestions, or answer questions. Try saying 'add [item name]' or 'help' for more options!"
    };
  };

  const detectCategory = (itemName: string): string => {
    const name = itemName.toLowerCase();
    // Sri Lankan items
    if (name.includes('rice') || name.includes('samba') || name.includes('kekulu')) return 'other';
    if (name.includes('coconut') || name.includes('thambili') || name.includes('pol')) return 'other';
    if (name.includes('curry leaves') || name.includes('pandan') || name.includes('rampe') || name.includes('gotukola') || name.includes('mukunuwenna') || name.includes('turmeric') || name.includes('dhal') || name.includes('green gram')) return 'vegetables';
    if (name.includes('cinnamon') || name.includes('cardamom') || name.includes('jaggery') || name.includes('kithul') || name.includes('kurakkan')) return 'other';
    // General items
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter') || name.includes('curd')) return 'dairy';
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) return 'meat';
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('berry') || name.includes('king coconut')) return 'fruits';
    if (name.includes('lettuce') || name.includes('carrot') || name.includes('tomato') || name.includes('onion')) return 'vegetables';
    if (name.includes('bread') || name.includes('bagel') || name.includes('roll') || name.includes('roti') || name.includes('hoppers')) return 'bread';
    if (name.includes('water') || name.includes('juice') || name.includes('soda') || name.includes('drink')) return 'beverages';
    if (name.includes('chip') || name.includes('cracker') || name.includes('cookie') || name.includes('snack')) return 'snacks';
    return 'other';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        {!isOpen && messages.length > 1 && (
          <span className="chat-badge">{messages.length - 1}</span>
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
                <p>Always here to help</p>
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
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (e.g., 'add milk' or 'show suggestions')"
              className="chat-input"
            />
            <button onClick={handleSend} className="chat-send-button" disabled={!input.trim()}>
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


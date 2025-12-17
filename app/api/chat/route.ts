import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getGroceryList, addGroceryItem, getPurchaseHistory } from '@/lib/storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the grocery assistant
const SYSTEM_PROMPT = `You are a Smart Grocery Shopping Assistant AI. Your role is to help users manage their grocery lists efficiently.

Your capabilities:
1. **Add Items**: When users want to add items, extract the item name, quantity, unit, and category. Respond with a JSON action.
2. **Predict Missing Items**: Based on purchase history, suggest items users might need.
3. **Healthier Alternatives**: Suggest healthier options for items (e.g., brown bread instead of white bread, red rice instead of white rice).
4. **Expiry Reminders**: Remind users about items that might be expiring based on typical shelf life.
5. **Answer Questions**: Help with grocery-related questions.

When the user wants to add an item, respond with this JSON format at the END of your message:
###ACTION###{"action":"add_item","name":"item name","category":"category","quantity":1,"unit":"pcs"}###END###

Categories available: dairy, meat, vegetables, fruits, bread, beverages, snacks, other

Examples:
- "add milk" → Add 1L of milk to dairy
- "add 2kg rice" → Add 2kg of rice to other
- "buy eggs" → Add eggs to dairy

For healthier alternatives:
- White bread → Brown bread or whole grain bread
- White rice → Red rice or brown rice
- Soda → Fresh juice or coconut water
- Sugar → Honey or jaggery

Be friendly, helpful, and concise. Use emojis occasionally to be engaging. If the user's request is unclear, ask for clarification.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get current grocery list and purchase history for context
    const groceryList = getGroceryList();
    const purchaseHistory = getPurchaseHistory();

    const contextMessage = `
Current grocery list (${groceryList.length} items): ${groceryList.map(item => `${item.name} (${item.category})`).join(', ') || 'Empty'}

Recent purchase history: ${purchaseHistory.slice(0, 5).map(h => h.itemName).join(', ') || 'No history'}
`;

    // Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextMessage },
    ];

    // Add conversation history (last 10 messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Check for action in response
    let action = null;
    const actionMatch = responseText.match(/###ACTION###(.+?)###END###/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
      } catch (e) {
        console.error('Failed to parse action:', e);
      }
    }

    // Clean response text (remove action JSON)
    const cleanResponse = responseText.replace(/###ACTION###.+?###END###/, '').trim();

    // If there's an add_item action, add the item to the list
    if (action && action.action === 'add_item') {
      try {
        const newItem = addGroceryItem({
          name: action.name,
          category: action.category || 'other',
          quantity: action.quantity || 1,
          unit: action.unit || 'pcs',
          isPurchased: false,
        });
        action.success = true;
        action.item = newItem;
      } catch (e) {
        console.error('Failed to add item:', e);
        action.success = false;
      }
    }

    return NextResponse.json({
      response: cleanResponse,
      action,
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json({ 
        error: 'Invalid API key',
        response: "I'm having trouble connecting to my AI brain. Please check the API key configuration."
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to process message',
      response: "I'm sorry, I encountered an error. Please try again."
    }, { status: 500 });
  }
}


import OpenAI from 'openai';
import { getOrderDetails, checkDeliveryStatus } from '../tools/order.tools.js';

const client = new OpenAI({
  apiKey: "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",
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'customer-support-ai',
  },
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class OrderAgentService {
  async *handleQuery(query: string, history: Message[]) {
    console.log('📦 Order agent handling query');
    
    // Extract order ID from query
    const orderMatch = query.match(/ORD-\d+/i);
    let orderContext = '';
    
    if (orderMatch) {
      const orderId = orderMatch[0].toUpperCase();
      console.log('🔍 Found order ID:', orderId);
      yield { type: 'reasoning', data: `Fetching details for ${orderId}...` };
      
      const details = await getOrderDetails(orderId);
      const status = await checkDeliveryStatus(orderId);
      
      orderContext = `\n\nRELEVANT ORDER DATA:\nOrder Details: ${JSON.stringify(details)}\nDelivery Status: ${JSON.stringify(status)}`;
      console.log('📋 Order info retrieved');
    }

    try {
      console.log('📞 Calling OpenRouter API...');
      
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { 
            role: 'system', 
            content: `You are an order management specialist. Help customers with order status and tracking. Use the provided order data to give accurate, concise information.${orderContext}` 
          },
          ...history.slice(-5).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: query },
        ],
        max_tokens: 500,
      });

      console.log('✅ OpenRouter responded');
      
      const responseText = completion.choices[0]?.message?.content || 'I could not retrieve order information.';
      console.log('✅ Order agent got response, length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 100));

      // Stream character by character
      for (const char of responseText) {
        yield { type: 'text', data: char };
        await new Promise(r => setTimeout(r, 10));
      }
      
    } catch (error) {
      console.error('❌ Order agent error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      yield { type: 'text', data: 'I apologize, but I am having trouble accessing order information.' };
    }
  }
}
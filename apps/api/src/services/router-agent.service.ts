import OpenAI from 'openai';
import { SupportAgentService } from './support-agent.service.js';
import { OrderAgentService } from './order-agent.service.js';
import { BillingAgentService } from './billing-agent.service.js';

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

export class RouterAgentService {
  private supportAgent: SupportAgentService;
  private orderAgent: OrderAgentService;
  private billingAgent: BillingAgentService;

  constructor() {
    this.supportAgent = new SupportAgentService();
    this.orderAgent = new OrderAgentService();
    this.billingAgent = new BillingAgentService();
  }

  async *handleQuery(query: string, history: Message[]) {
    console.log('🔍 Router analyzing query:', query);
    
    yield { type: 'reasoning', data: 'Analyzing query intent...' };

    try {
      console.log('📞 Calling OpenRouter API for classification...');
      
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        max_tokens: 20,
        messages: [
          {
            role: 'system',
            content: `You are a query classifier. Based on the user's query, classify it into one of these categories:
            - SUPPORT: For general questions, troubleshooting, how-to guides, password resets, FAQs
            - ORDER: For order status, tracking, delivery, cancellations, modifications (look for words like "order", "track", "delivery", "cancel")
            - BILLING: For payments, invoices, refunds, charges, billing issues (look for words like "invoice", "refund", "payment", "charge", "bill")
            
            Respond with ONLY the category name: SUPPORT, ORDER, or BILLING`
          },
          {
            role: 'user',
            content: `Classify this query: "${query}"`
          }
        ],
        temperature: 0.1,
      });

      console.log('✅ OpenRouter responded');
      
      const responseText = completion.choices[0]?.message?.content?.trim() || 'SUPPORT';
      console.log('📝 Classification response:', responseText);

      // Normalize the response
      const normalized = responseText.toUpperCase();
      let category = 'SUPPORT';
      
      if (normalized.includes('ORDER')) {
        category = 'ORDER';
      } else if (normalized.includes('BILLING')) {
        category = 'BILLING';
      } else if (normalized.includes('SUPPORT')) {
        category = 'SUPPORT';
      } else {
        // Fallback logic based on keywords
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('order') || lowerQuery.includes('ord-') || lowerQuery.includes('track') || lowerQuery.includes('deliver')) {
          category = 'ORDER';
        } else if (lowerQuery.includes('invoice') || lowerQuery.includes('inv-') || lowerQuery.includes('refund') || lowerQuery.includes('ref-') || lowerQuery.includes('bill') || lowerQuery.includes('payment')) {
          category = 'BILLING';
        }
      }

      console.log('🎯 Selected category:', category);
      yield { type: 'agent_selected', data: category };

      let agent;
      switch (category) {
        case 'ORDER':
          agent = this.orderAgent;
          yield { type: 'reasoning', data: 'Routing to Order Specialist...' };
          break;
        case 'BILLING':
          agent = this.billingAgent;
          yield { type: 'reasoning', data: 'Routing to Billing Specialist...' };
          break;
        default:
          agent = this.supportAgent;
          yield { type: 'reasoning', data: 'Routing to Support Agent...' };
      }

      console.log('🤖 Delegating to', category, 'agent...');
      
      // Ensure we yield something before delegating
      yield { type: 'text', data: '' };
      
      // Delegate to the appropriate agent
      for await (const chunk of agent.handleQuery(query, history)) {
        yield chunk;
      }
      
    } catch (error) {
      console.error('❌ Router error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      yield { type: 'text', data: 'I apologize, but I encountered an error analyzing your request. ' };
      
      // Fallback to support agent
      yield* this.supportAgent.handleQuery(query, history);
    }
  }
}
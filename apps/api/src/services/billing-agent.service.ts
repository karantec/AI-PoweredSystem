import OpenAI from 'openai';
import { getInvoiceDetails, checkRefundStatus } from '../tools/billing.tools.js';

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

export class BillingAgentService {
  async *handleQuery(query: string, history: Message[]) {
    console.log('💰 Billing agent handling query');
    
    // Extract invoice or refund ID
    const invoiceMatch = query.match(/INV-\d+/i);
    const refundMatch = query.match(/REF-\d+/i);
    let billingContext = '';
    
    if (invoiceMatch) {
      const invoiceId = invoiceMatch[0].toUpperCase();
      console.log('🔍 Found invoice ID:', invoiceId);
      yield { type: 'reasoning', data: `Fetching invoice ${invoiceId}...` };
      
      const details = await getInvoiceDetails(invoiceId);
      billingContext = `\n\nRELEVANT INVOICE DATA:\n${JSON.stringify(details)}`;
      console.log('📋 Invoice info retrieved');
    }
    
    if (refundMatch) {
      const refundId = refundMatch[0].toUpperCase();
      console.log('🔍 Found refund ID:', refundId);
      yield { type: 'reasoning', data: `Checking refund ${refundId}...` };
      
      const details = await checkRefundStatus(refundId);
      billingContext += `\n\nRELEVANT REFUND DATA:\n${JSON.stringify(details)}`;
      console.log('📋 Refund info retrieved');
    }

    try {
      console.log('📞 Calling OpenRouter API...');
      
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { 
            role: 'system', 
            content: `You are a billing specialist. Help customers with payments, refunds, and invoices. Be empathetic, professional, and concise. Use the provided billing data to give accurate information.${billingContext}` 
          },
          ...history.slice(-5).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: query },
        ],
        max_tokens: 500,
      });

      console.log('✅ OpenRouter responded');
      
      const responseText = completion.choices[0]?.message?.content || 'I could not retrieve billing information.';
      console.log('✅ Billing agent got response, length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 100));

      // Stream character by character
      for (const char of responseText) {
        yield { type: 'text', data: char };
        await new Promise(r => setTimeout(r, 10));
      }
      
    } catch (error) {
      console.error('❌ Billing agent error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      yield { type: 'text', data: 'I apologize, but I am having trouble accessing billing information.' };
    }
  }
}
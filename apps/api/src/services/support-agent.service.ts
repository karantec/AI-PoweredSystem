import OpenAI from 'openai';

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

export class SupportAgentService {
  async *handleQuery(query: string, history: Message[]) {
    console.log('💬 Support agent handling query');
    
    try {
      console.log('📞 Calling OpenRouter API...');
      
      const completion = await client.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: 'You are a helpful customer support agent. Be friendly, clear, and solution-oriented. Keep responses concise.' },
          ...history.slice(-5).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: query },
        ],
        max_tokens: 500,
      });

      console.log('✅ OpenRouter responded');
      
      const responseText = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      console.log('✅ Support agent got response, length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 100));

      // Stream character by character
      for (const char of responseText) {
        yield { type: 'text', data: char };
        await new Promise(r => setTimeout(r, 10));
      }
      
    } catch (error) {
      console.error('❌ Support agent error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      yield { type: 'text', data: 'I apologize, but I am having trouble processing your request right now.' };
    }
  }
}
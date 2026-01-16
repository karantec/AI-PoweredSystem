import { ConversationService } from '../services/conversation.service.js';
import { RouterAgentService } from '../services/router-agent.service.js';
import type { StreamingApi } from 'hono/utils/stream';

interface SendMessageRequest {
  conversationId?: string;
  message: string;
  userId: string;
}

export class ChatController {
  private conversationService: ConversationService;
  private routerAgent: RouterAgentService;

  constructor() {
    this.conversationService = new ConversationService();
    this.routerAgent = new RouterAgentService();
  }

  async sendMessage(req: SendMessageRequest, stream: StreamingApi) {
    console.log('='.repeat(60));
    console.log('📨 NEW MESSAGE RECEIVED');
    console.log('User ID:', req.userId);
    console.log('Message:', req.message);
    console.log('Conversation ID:', req.conversationId || 'NEW');
    console.log('='.repeat(60));
    
    try {
      console.log('✍️  Writing status to stream...');
      await stream.write(JSON.stringify({ type: 'status', data: 'thinking' }) + '\n');
      
      let conversationId = req.conversationId;
      if (!conversationId) {
        console.log('🆕 Creating new conversation...');
        const conv = await this.conversationService.createConversation(req.userId);
        conversationId = conv.id;
        console.log('✅ Conversation created:', conversationId);
        
        await stream.write(JSON.stringify({ 
          type: 'conversation_id', 
          data: conversationId 
        }) + '\n');
      }

      console.log('💾 Saving user message to database...');
      await this.conversationService.addMessage(conversationId, {
        role: 'user',
        content: req.message,
      });
      console.log('✅ User message saved');

      console.log('📚 Loading conversation history...');
      const history = await this.conversationService.getConversationHistory(conversationId);
      console.log('✅ History loaded, messages:', history.length);

      let fullResponse = '';
      let currentAgent = '';
      let chunkCount = 0;

      console.log('🚀 Starting router agent query...');
      
      for await (const chunk of this.routerAgent.handleQuery(req.message, history)) {
        chunkCount++;
        
        // Only log every 10th chunk to avoid too much console spam
        if (chunkCount % 10 === 0 || chunk.type !== 'text') {
          console.log(`📦 Chunk ${chunkCount}:`, chunk);
        }
        
        if (chunk.type === 'agent_selected') {
          currentAgent = chunk.data;
          console.log('🎯 AGENT SELECTED:', currentAgent);
          await stream.write(JSON.stringify({ 
            type: 'agent', 
            data: currentAgent 
          }) + '\n');
        } else if (chunk.type === 'reasoning') {
          console.log('🧠 REASONING:', chunk.data);
          await stream.write(JSON.stringify({ 
            type: 'reasoning', 
            data: chunk.data 
          }) + '\n');
        } else if (chunk.type === 'text' && chunk.data) {
          fullResponse += chunk.data;
          await stream.write(JSON.stringify({ 
            type: 'text', 
            data: chunk.data 
          }) + '\n');
        }
      }

      console.log('✅ Router completed');
      console.log('📊 Total chunks:', chunkCount);
      console.log('📝 Full response length:', fullResponse.length);
      console.log('🤖 Agent used:', currentAgent);

      if (fullResponse) {
        console.log('💾 Saving assistant message...');
        await this.conversationService.addMessage(conversationId, {
          role: 'assistant',
          content: fullResponse,
          agent: currentAgent,
        });
        console.log('✅ Assistant message saved');
      } else {
        console.log('⚠️  WARNING: No response generated!');
      }

      await stream.write(JSON.stringify({ type: 'done' }) + '\n');
      console.log('✅ Stream completed successfully');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ ERROR in sendMessage:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error instanceof Error ? error.message : error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.log('='.repeat(60));
      
      await stream.write(JSON.stringify({ 
        type: 'error', 
        data: error instanceof Error ? error.message : 'Unknown error' 
      }) + '\n');
    }
  }

  async getConversation(id: string) {
    return this.conversationService.getConversation(id);
  }

  async listConversations(userId?: string) {
    if (!userId) throw new Error('userId is required');
    return this.conversationService.listConversations(userId);
  }

  async deleteConversation(id: string) {
    return this.conversationService.deleteConversation(id);
  }
}
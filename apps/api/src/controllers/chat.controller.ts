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
    console.log('Conversation ID:', req.conversationId ?? 'NEW');
    console.log('='.repeat(60));

    try {
      await stream.write(
        JSON.stringify({ type: 'status', data: 'thinking' }) + '\n'
      );

      let conversationId = req.conversationId;

      if (!conversationId) {
        console.log('🆕 Creating new conversation...');
        const conversation =
          await this.conversationService.createConversation(req.userId);

        conversationId = conversation.id;

        await stream.write(
          JSON.stringify({
            type: 'conversation_id',
            data: conversationId,
          }) + '\n'
        );
      }

      console.log('💾 Saving user message...');
      await this.conversationService.addMessage(conversationId, {
        role: 'user',
        content: req.message,
      });

      console.log('📚 Loading conversation history...');
      const history =
        await this.conversationService.getConversationHistory(conversationId);

      let fullResponse = '';
      let currentAgent = '';
      let chunkCount = 0;

      console.log('🚀 Routing message to agent...');

      for await (const chunk of this.routerAgent.handleQuery(
        req.message,
        history
      )) {
        chunkCount++;

        if (chunk.type === 'agent_selected') {
          currentAgent = chunk.data;

          await stream.write(
            JSON.stringify({
              type: 'agent',
              data: currentAgent,
            }) + '\n'
          );
        }

        if (chunk.type === 'reasoning') {
          await stream.write(
            JSON.stringify({
              type: 'reasoning',
              data: chunk.data,
            }) + '\n'
          );
        }

        if (chunk.type === 'text' && chunk.data) {
          fullResponse += chunk.data;

          await stream.write(
            JSON.stringify({
              type: 'text',
              data: chunk.data,
            }) + '\n'
          );
        }
      }

      console.log('📝 Full response length:', fullResponse.length);

      if (fullResponse) {
        console.log('💾 Saving assistant message...');
        await this.conversationService.addMessage(conversationId, {
          role: 'assistant',
          content: fullResponse,
          agent: currentAgent,
        });
      }

      await stream.write(JSON.stringify({ type: 'done' }) + '\n');
      console.log('✅ Stream completed');
      console.log('='.repeat(60));
    } catch (error) {
      console.error('❌ ERROR in sendMessage');

      if (error instanceof Error) {
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Unknown error:', error);
      }

      await stream.write(
        JSON.stringify({
          type: 'error',
          data:
            error instanceof Error ? error.message : 'Unknown server error',
        }) + '\n'
      );
    }
  }

  async getConversation(id: string) {
    return this.conversationService.getConversation(id);
  }

  async listConversations(userId?: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.conversationService.listConversations(userId);
  }

  async deleteConversation(id: string) {
    return this.conversationService.deleteConversation(id);
  }
}

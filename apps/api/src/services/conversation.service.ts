// apps/api/src/services/conversation.service.ts
import { db } from '../db/index.js';
import { conversations, messages } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

export class ConversationService {
  async createConversation(userId: string) {
    const [conversation] = await db
      .insert(conversations)
      .values({ 
        id: crypto.randomUUID(), 
        userId 
      })
      .returning();
    return conversation;
  }

  async addMessage(conversationId: string, message: Message) {
    const [msg] = await db
      .insert(messages)
      .values({
        id: crypto.randomUUID(),
        conversationId,
        role: message.role,
        agentType: message.agent,
        content: message.content,
      })
      .returning();
    return msg;
  }

  async getConversation(id: string) {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation) throw new Error('Conversation not found');

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    return {
      ...conversation,
      messages: msgs,
    };
  }

  async getConversationHistory(id: string): Promise<Message[]> {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    return msgs.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      agent: m.agentType || undefined,
    }));
  }

  async listConversations(userId: string) {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  }

  async deleteConversation(id: string) {
    await db.delete(conversations).where(eq(conversations.id, id));
  }
}
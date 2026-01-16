import { db } from '../db/index.js';
import { messages } from '../db/schema.js';
import { eq, desc, like } from 'drizzle-orm';

export async function getConversationHistory(topic: string) {
  try {
    const results = await db
      .select()
      .from(messages)
      .where(like(messages.content, `%${topic}%`))
      .orderBy(desc(messages.createdAt))
      .limit(5);

    return {
      topic,
      relatedMessages: results.map(m => ({
        content: m.content,
        role: m.role,
        timestamp: m.createdAt,
      })),
      count: results.length,
    };
  } catch (error) {
    return {
      error: 'Failed to query conversation history',
      topic,
    };
  }
}
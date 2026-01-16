import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { ChatController } from '../controllers/chat.controller.js';

export const chatRoutes = new Hono();
const controller = new ChatController();

chatRoutes.post('/messages', async (c) => {
  console.log('🔥 CHAT ROUTE HIT');
  const { conversationId, message, userId } = await c.req.json();
  
  return stream(c, async (stream) => {
    await controller.sendMessage(
      { conversationId, message, userId },
      stream
    );
  });
});

chatRoutes.get('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const conversation = await controller.getConversation(id);
  return c.json(conversation);
});

chatRoutes.get('/conversations', async (c) => {
  const userId = c.req.query('userId');
  const conversations = await controller.listConversations(userId);
  return c.json(conversations);
});

chatRoutes.delete('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  await controller.deleteConversation(id);
  return c.json({ success: true });
});
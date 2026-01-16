import { Hono } from 'hono';
import { AgentController } from '../controllers/agent.controller.js';

export const agentRoutes = new Hono();
const controller = new AgentController();

agentRoutes.get('/agents', async (c) => {
  const agents = await controller.listAgents();
  return c.json(agents);
});

agentRoutes.get('/agents/:type/capabilities', async (c) => {
  const type = c.req.param('type');
  const capabilities = await controller.getCapabilities(type);
  return c.json(capabilities);
});
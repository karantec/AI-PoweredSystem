import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { chatRoutes } from './routes/chat.routes.js';
import { agentRoutes } from './routes/agents.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// app.use('/api/*', rateLimitMiddleware);

// Routes
app.route('/api/chat', chatRoutes);
app.route('/api/agents', agentRoutes);
app.route('/api', healthRoutes);

// Error handling
app.onError(errorMiddleware);

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;

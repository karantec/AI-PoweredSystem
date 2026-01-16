import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // 100 requests
const WINDOW_MS = 60 * 1000; // per 1 minute

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Create new rate limit entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
  } else {
    // Increment existing count
    userLimit.count++;
    
    if (userLimit.count > RATE_LIMIT) {
      throw new HTTPException(429, {
        message: 'Too many requests. Please try again later.',
      });
    }
  }

  // Cleanup old entries (1% chance on each request)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  await next();
};

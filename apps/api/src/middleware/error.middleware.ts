import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorMiddleware = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  return c.json(
    {
      error: err.message || 'Internal Server Error',
      status: 500,
    },
    500
  );
};
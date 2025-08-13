/**
 * @fileoverview This is the main Cloudflare Worker file that handles routing
 * for the chat application. It defines the API endpoints and interacts with
 * the ChatSession Durable Object.
 */

import { Hono } from 'hono';
import { ChatSession } from './ChatSession';
import { Env } from './types';

/**
 * Creates a new Hono application instance, specifying the Env interface
 * for type-safe access to environment variables and bindings.
 */
const app = new Hono<{ Bindings: Env }>();

/**
 * Endpoint for Server-Sent Events (SSE).
 * This is a placeholder for a future feature, for example, to provide
 * real-time updates or notifications to the client.
 * @param {Context} c - The Hono context object for the request.
 * @returns {Response} A streaming response with a simple "hello" message.
 */
app.get('/api/sse', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`data: hello\n\n`);
    }
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
});

/**
 * Endpoint for the WebSocket chat session.
 * It gets or creates a Durable Object instance for a given session ID
 * and forwards the request to the Durable Object's fetch method.
 * @param {Context} c - The Hono context object for the request.
 * @returns {Promise<Response>} The response from the Durable Object.
 */
app.all('/api/chat', async (c) => {
  // Use a session ID from the query parameter, or generate a new one.
  const id = c.req.query('id') || crypto.randomUUID();
  
  // Get the Durable Object stub for the given session ID.
  // The idFromName method ensures a consistent Durable Object instance for the same ID.
  const stub = c.env.CHAT_SESSION.get(c.env.CHAT_SESSION.idFromName(id));
  
  // Forward the incoming request directly to the Durable Object.
  // This is a powerful feature of Cloudflare Workers and Durable Objects.
  return await stub.fetch(c.req.raw);
});

/**
 * A simple root endpoint to confirm the worker is running.
 * @param {Context} c - The Hono context object for the request.
 * @returns {Response} A text response with the message "Worker up".
 */
app.get('/', (c) => c.text('Worker up'));

/**
 * Exports the ChatSession Durable Object class so that the main worker
 * can access it and bind it in the `wrangler.toml` file.
 */
export { ChatSession };

/**
 * Exports the Hono app as the default handler for the worker.
 */
export default app;

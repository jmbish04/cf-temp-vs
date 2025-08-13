import { Hono } from 'hono';
import { ChatSession } from './ChatSession';

export interface Env {
  CHAT_SESSION: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

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

app.all('/api/chat', async (c) => {
  const id = c.req.query('id') || crypto.randomUUID();
  const stub = c.env.CHAT_SESSION.get(c.env.CHAT_SESSION.idFromName(id));
  return await stub.fetch(c.req.raw);
});

app.get('/', (c) => c.text('Worker up'));

export { ChatSession };
export default app;

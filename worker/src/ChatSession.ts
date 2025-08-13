export interface Env {
  AI: any;
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
}

export class ChatSession {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      server.addEventListener('message', async (evt) => {
        const prompt = evt.data;
        // Simple echo; real implementation would call AI models
        const response = await this.generate(prompt);
        server.send(JSON.stringify({ id: crypto.randomUUID(), role: 'assistant', content: response }));
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Chat session active', { status: 200 });
  }

  private async generate(prompt: string): Promise<string> {
    // Placeholder for AI agent selection; returning echo for now
    return `You said: ${prompt}`;
  }
}

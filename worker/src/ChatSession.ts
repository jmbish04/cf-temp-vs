/**
 * Interface for the Cloudflare Worker environment variables.
 * These are configured in the `wrangler.toml` file.
 * @property {import('@cloudflare/workers-types').Ai} AI - The Cloudflare AI binding for on-platform model inference.
 * @property {string} OPENAI_API_KEY - The API key for the OpenAI service.
 * @property {string} GEMINI_API_KEY - The API key for the Google Gemini service.
 */
export interface Env {
  AI: import('@cloudflare/workers-types').Ai;
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
}

/**
 * Defines the structure of the message payload sent over the WebSocket.
 * This allows the client to specify which agent to use and the prompt.
 * @property {'cloudflare' | 'openai' | 'gemini'} agent - The name of the AI agent to use.
 * @property {string} prompt - The user's prompt or message.
 */
interface WebSocketMessage {
  agent: 'cloudflare' | 'openai' | 'gemini';
  prompt: string;
}

/**
 * A Cloudflare Durable Object that manages a persistent chat session
 * using WebSockets. It routes user prompts to different AI agents
 * based on the client's request.
 */
export class ChatSession {
  private state: DurableObjectState;
  private env: Env;
  
  /**
   * Constructs a new ChatSession Durable Object.
   * @param {DurableObjectState} state - The state object for the Durable Object.
   * @param {Env} env - The environment variables for the Worker.
   */
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  /**
   * Handles incoming HTTP requests to the Durable Object.
   * Upgrades WebSocket connections and sets up event listeners.
   * @param {Request} request - The incoming HTTP request.
   * @returns {Response} A WebSocket upgrade response or a standard HTTP response.
   */
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      server.addEventListener('message', async (evt) => {
        try {
          const message: WebSocketMessage = JSON.parse(evt.data as string);
          
          if (!message.agent || !message.prompt) {
            server.send(JSON.stringify({
              id: crypto.randomUUID(),
              role: 'error',
              content: 'Invalid message format. Please provide both "agent" and "prompt".'
            }));
            return;
          }

          const response = await this.generate(message);
          server.send(JSON.stringify({ id: crypto.randomUUID(), role: 'assistant', content: response }));
        } catch (err: any) {
          console.error('Error processing WebSocket message:', err);
          server.send(JSON.stringify({
            id: crypto.randomUUID(),
            role: 'error',
            content: `Failed to process your request: ${err.message}`
          }));
        }
      });

      server.addEventListener('close', () => {
        // Handle connection closing logic, e.g., cleaning up state
        console.log('WebSocket connection closed.');
      });
      
      server.addEventListener('error', (err) => {
        // Handle WebSocket errors
        console.error('WebSocket error:', (err as any).error);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Chat session active', { status: 200 });
  }

  /**
   * A router method that selects and calls the appropriate AI agent.
   * @param {WebSocketMessage} message - The structured message containing the agent and prompt.
   * @returns {Promise<string>} The generated response from the selected AI model.
   * @throws {Error} If the specified agent is not supported.
   */
  private async generate(message: WebSocketMessage): Promise<string> {
    switch (message.agent) {
      case 'cloudflare':
        return await this.generateWithCloudflare(message.prompt);
      case 'openai':
        return await this.generateWithOpenAI(message.prompt);
      case 'gemini':
        return await this.generateWithGemini(message.prompt);
      default:
        throw new Error(`Unsupported agent type: ${message.agent}. Please use 'cloudflare', 'openai', or 'gemini'.`);
    }
  }

  /**
   * Generates a response using Cloudflare's Workers AI binding.
   * @param {string} prompt - The user's text prompt.
   * @returns {Promise<string>} The generated text response.
   */
  private async generateWithCloudflare(prompt: string): Promise<string> {
    try {
      const response = await this.env.AI.run(
        '@cf/meta/llama-3-8b-instruct', // Using a powerful, on-platform model
        { messages: [{ role: 'user', content: prompt }] }
      );
      return response.response;
    } catch (err) {
      console.error('Cloudflare AI call failed:', err);
      throw new Error('Failed to generate response with Cloudflare AI.');
    }
  }

  /**
   * Generates a response by calling the OpenAI Chat Completions API.
   * @param {string} prompt - The user's text prompt.
   * @returns {Promise<string>} The generated text response.
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json() as any;
      return result.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI API call failed:', err);
      throw new Error('Failed to generate response with OpenAI.');
    }
  }

  /**
   * Generates a response by calling the Google Gemini API.
   * @param {string} prompt - The user's text prompt.
   * @returns {Promise<string>} The generated text response.
   */
  private async generateWithGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.env.GEMINI_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json() as any;
      return result.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error('Gemini API call failed:', err);
      throw new Error('Failed to generate response with Gemini.');
    }
  }
}

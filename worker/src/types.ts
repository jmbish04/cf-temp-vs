/**
 * Interface for all Cloudflare Worker environment variables.
 * This combines bindings for both the main worker and the Durable Object.
 * @property {DurableObjectNamespace} CHAT_SESSION - Durable Object binding for chat sessions.
 * @property {import('@cloudflare/workers-types').Ai} AI - Cloudflare AI binding for on-platform inference.
 * @property {string} OPENAI_API_KEY - API key for the OpenAI service.
 * @property {string} GEMINI_API_KEY - API key for the Google Gemini service.
 */
export interface Env {
  CHAT_SESSION: DurableObjectNamespace;
  AI: import('@cloudflare/workers-types').Ai;
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
}

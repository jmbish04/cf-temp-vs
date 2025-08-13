# Cloudflare Worker MCP Template

This repository provides a full-stack template featuring a Vue 3 frontend and a Cloudflare Worker backend. It demonstrates Model Context Protocol (MCP) communication, durable objects, and AI integration, and can serve as a starting point for edge-deployed applications.

## Features
- Vue 3 + Vite + Tailwind + shadcn/vue UI
- Hono-powered Cloudflare Worker with Durable Object `ChatSession`
- Real-time chat over WebSockets and Server-Sent Events
- AI-ready architecture using Workers AI, OpenAI, or Gemini
- Unit tests via Vitest

## Development

### Install dependencies
```bash
npm install
```

### Run development servers
```bash
npm run dev
```
This starts Vite for the frontend and Wrangler for the Worker.

### Build
```bash
npm run build
```
Builds the Vue app and performs a dry-run build of the Worker.

## Testing
```bash
npm test
```
Runs Vitest tests for the Worker.

## Deployment
Ensure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) configured with your Cloudflare account and run:
```bash
npm run build
wrangler deploy
```

## Environment
Set the required secrets for AI providers:
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put GEMINI_API_KEY
```

## Notes
This template includes placeholder AI logic and minimal UI components. Extend the `ChatSession` durable object and Vue components to integrate full MCP agents and generative UI experiences.

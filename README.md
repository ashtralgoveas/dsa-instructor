# DSA Instructor

A simple AI-powered Data Structures & Algorithms instructor.

Open the app, ask anything about DSA, and get a clear explanation from Gemini.

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI:** Google GenAI (`@google/genai`) Interactions API

## Setup

1. Install dependencies from the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

2. Create a `.env` file in the project root (already gitignored):

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

3. Start both apps:

```bash
npm run dev
```

- API: `http://localhost:3000`
- UI: `http://localhost:5173`

Or start them separately:

```bash
npm run dev:server
npm run dev:client
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google GenAI API key (backend only) |
| `PORT` | Backend port (default `3000`) |

The React app never receives the API key. It calls the Express API, which proxies requests to Gemini.

## Backend API

### Health

`GET /api/health`

```json
{ "status": "ok" }
```

### Ask instructor

`POST /api/dsa/ask`

Request (only `question` is required):

```json
{
  "question": "How does it work?",
  "previousInteractionId": "optional-interaction-id-for-follow-ups"
}
```

Response:

```json
{
  "interactionId": "...",
  "response": {
    "question": "...",
    "explanation": "...",
    "example": "...",
    "approach": "...",
    "code": "...",
    "language": "javascript",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)"
  }
}
```

Follow-ups use Google Interactions `previous_interaction_id` via `previousInteractionId`.

## Curl examples

```bash
curl http://localhost:3000/api/health
```

macOS / Linux:

```bash
curl -X POST http://localhost:3000/api/dsa/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is a HashMap?"
  }'
```

Windows PowerShell:

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/dsa/ask -ContentType "application/json" -Body '{"question":"What is a HashMap?"}'
```

## Current features

- Freeform DSA questions (no required topic/difficulty)
- Fixed sidebar + independently scrollable main content
- Routes: `/dashboard`, `/topics`, `/history`, `/settings`
- Conversational follow-ups via Interactions `previous_interaction_id`
- Topics page that prefills a Dashboard question
- Local history of successful questions
- Simple settings: dark/light mode + simple/detailed response style
- Adaptive answer sections (empty sections are hidden)
- Loading, quota, and retry handling

## Project structure

```
client/   React + Vite frontend
server/   Express + GenAI backend
.env      Local secrets (not committed)
```

## Production (single server)

After building, Express serves the API **and** the React app from `client/dist` on the same port. The frontend keeps calling `/api/...` (same origin).

### Build and run locally

```bash
npm run install:all
npm run build
npm start
```

Open `http://localhost:3000` (or your `PORT`).

### Deploy on Render

1. Push this project to GitHub (do **not** commit `.env`).
2. On [render.com](https://render.com): **New → Web Service** → connect the repo.
3. Settings:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
4. Environment variables:
   - `GEMINI_API_KEY` = your Gemini API key
   - `NODE_ENV` = `production`
5. Deploy, then open the Render URL.

A `render.yaml` is included if you prefer Blueprint deploy.

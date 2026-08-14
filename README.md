# DSA Instructor

A simple AI-powered Data Structures & Algorithms instructor. Ask a DSA question and get a clear explanation from Gemini.

Built with **React**, **Express**, and **Google Gemini**.

## Prerequisites

- **Node.js** `>= 20`
- **npm** (comes with Node.js)
- A **Google Gemini API key**

## Installation

After cloning the repository, install dependencies for the root, backend, and frontend:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Or use the shortcut:

```bash
npm run install:all
```

## Environment variables

1. Copy the example env file to a real `.env` in the **project root**:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Edit `.env` and set your values:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (backend only) |
| `PORT` | No | Backend port (defaults to `3000`) |

- Use `.env.example` as the template.
- Never commit `.env`.
- Never put the Gemini API key in the frontend.

## Run the application

Start both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server
npm run dev:client
```

## Local URLs

| | URL |
|--|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

In development, the Vite frontend proxies `/api` requests to the backend.

## Build

Build the backend and frontend:

```bash
npm run build
```

Run the production server (serves the API and the built frontend on the same port):

```bash
npm start
```

Then open http://localhost:3000 (or your configured `PORT`).

## API / Gemini

```
React frontend → Express backend → Google Gemini API
```

The Gemini API key stays on the backend. The model used is **`gemini-3.6-flash`**.

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| Missing API key | Ensure `.env` exists in the project root and `GEMINI_API_KEY` is set |
| Module / dependency errors | Run the three install commands (or `npm run install:all`) again |
| Port already in use | Change `PORT` in `.env`, or stop whatever is using `3000` / `5173` |
| Gemini 429 / quota error | Your API quota is exhausted — wait for reset or check your Google AI quota |
| Frontend can’t reach backend | Confirm the backend is running on port `3000` and you started the app with `npm run dev` |

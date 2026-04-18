# Campus Tech Events Finder

A lightweight website that sends student event preferences to your Dify app and shows the answer in a polished interface.

## What it does

- collects interests, time range, city, and extra context
- sends that data to a backend route
- keeps your Dify API key on the server instead of exposing it in the browser
- renders the Dify response as readable Markdown

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your Dify values:
   - `DIFY_API_KEY`
   - `DIFY_BASE_URL`
   - `DIFY_USER_ID`
   - `DIFY_APP_MODE`
3. Start the app:

```bash
npm start
```

4. Open `http://localhost:3000`

## Dify notes

- Use `DIFY_APP_MODE=chat` if your Dify app is a chat or agent app using `/chat-messages`.
- Use `DIFY_APP_MODE=workflow` if your app is a workflow using `/workflows/run`.
- Chat and Agent apps are sent with `response_mode=streaming` internally, then the server combines the streamed chunks before returning them to the browser.
- The backend currently sends a natural language `query` plus structured `inputs`.
- For your current Dify agent, the structured inputs are `interests` and `location`.
- The website's time range, max events, and extra notes are folded into the natural-language query so you can keep a simple Dify variable schema.

## Customizing the agent behavior

Edit `buildPrompt()` in `server.mjs` if you want the prompt to enforce a stricter format such as:

- table output
- only free events
- only online events
- only events in a specific country
- scholarship or student-discount friendly events

## File overview

- `server.mjs`: static file server plus Dify proxy route
- `public/index.html`: page structure
- `public/styles.css`: visual design
- `public/app.js`: form submission and response rendering

# Trace — Agentic SaaS Testing

A private testing workspace for exploring SaaS products and reviewing reproducible bug reports.

**Live app:** https://trace-agentic-qa.globalgupta14.chatgpt.site

## What is included

- **Sandbox browser:** operates the built-in Orbit sample SaaS, follows navigation, scrolls pages, clicks sample controls, and reports observed bugs.
- **Document audit:** checks a public URL, follows same-origin links, records HTTP responses, and flags potential problems in initial HTML. It does not execute application JavaScript.
- **Connected browser:** a separate Playwright runner explores rendered pages, records JavaScript errors and focused accessibility/layout findings, and captures screenshot evidence. An optional compatible model selects actions based on the user's goal and persona.
- **Testing workspace:** persisted run history, activity trails, page coverage, issue details and status updates, and JSON/Markdown exports.

## Project structure

| Directory | Purpose |
| --- | --- |
| `app/` | Dashboard, shared styles, and HTTP API routes |
| `components/` | Application components and installed UI primitives |
| `lib/` | Audit engine, sandbox browser agent, models, and storage helpers |
| `db/` | Database schema and binding types |
| `drizzle/` | Versioned SQLite/D1 migrations |
| `runner/` | Standalone Playwright browser runner, tests, and connection guide |
| `public/` | Favicon and downloadable runner package |
| `.openai/hosting.json` | Existing Sites deployment identity and logical database binding |

The web application uses React, TypeScript, Vinext/Vite, Cloudflare Workers, and D1. The browser runner uses Node.js and Playwright and runs separately from the hosted Worker.

## Run the dashboard locally

Requirements: Node.js 22 or later and npm.

```bash
npm ci
```

Initialize the local database once on a fresh checkout:

```bash
npx wrangler d1 execute DB --local --config wrangler.local.json --file drizzle/0000_odd_fallen_one.sql
```

Then start the app:

```bash
npm run dev
```

Open the local address printed by the development server. No model credentials are needed for the sandbox or document audits.

## Connect the Playwright runner

See [the complete runner guide](runner/README.md).

```bash
cd runner
npm ci
npx playwright install chromium
cp -n .env.example .env
```

Generate a token and save it in `runner/.env` as `TRACE_RUNNER_TOKEN`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ensure `TRACE_ALLOWED_ORIGINS` contains the exact app origin (scheme and hostname, no trailing slash):

```dotenv
TRACE_ALLOWED_ORIGINS=http://localhost:3000,https://trace-agentic-qa.globalgupta14.chatgpt.site
HOST=127.0.0.1
PORT=4318
```

Start the runner:

```bash
npm start
```

In Trace, open **Connections**, enter `http://127.0.0.1:4318` and the same token, then click **Connect browser**. Leave the runner terminal and the app tab open during tests. Restart the runner after changing `.env`; reconnect after refreshing the app.

### AI planning

Configure `MODEL_API_URL`, `MODEL_API_KEY`, and `MODEL_NAME` on the runner. The endpoint must support the chat/completions protocol described in the runner guide. Without a model connection, browser exploration is explicitly labeled heuristic.

For signed-in SaaS testing, set `STORAGE_STATE_PATH` to a private Playwright storage-state file for a dedicated test account. These credentials stay on the runner.

## Validation

```bash
npx tsc --noEmit
npm run build
```

Runner tests (require the installed Chromium browser):

```bash
cd runner
npm test
```

An installed Chrome channel can be used with `BROWSER_CHANNEL=chrome npm test`.

The dashboard build and API integration checks passed during initial development. URL-boundary and planner-action validation tests passed. The browser integration test was initially blocked by the development environment preventing Chrome startup; real-browser execution still requires validation on a machine where Playwright can launch its browser. Live model execution also requires provider credentials.

## Scope and limitations

This is an initial implementation. Test coverage is bounded by page count, reachable navigation, authentication, and the runner's allowed actions; it cannot guarantee finding every bug. Current model-driven actions are clicks, scrolling, or finishing. Arbitrary text entry and complete form-submission workflows are not implemented. Accessibility checks require human review and are not a full compliance audit.

The hosted app and local runner use separate execution environments. State-changing runner requests are blocked by default; enable them only for a disposable test environment. Never commit actual `.env` files, connection tokens, model keys, or login/session state.

## Deployment

The existing app is privately hosted with Sites. Its project identity is preserved in `.openai/hosting.json`. Publishing source to GitHub does not automatically deploy changes. The local Wrangler configuration is only for database initialization; production bindings and migrations are managed by Sites.

# Trace browser runner

The execution layer for Trace: Playwright browser automation, link navigation, scrolling, rendered-page checks, JavaScript errors, and screenshot evidence. With a configured model, AI selects browser actions from observed controls according to the persona and goal. Without a model, it explicitly reports heuristic exploration.

## Start

1. Install Node.js 22 or later.
2. Run `npm ci`, then `npx playwright install chromium` in this directory.
3. Copy `.env.example` to `.env`. Set TRACE_RUNNER_TOKEN to a random token of at least 24 characters; the command in the example generates one.
4. Set TRACE_ALLOWED_ORIGINS to the exact Trace app origin.
5. Run `npm start`. Connect in Trace → Connections using `http://localhost:4318` and the token. Your browser may request local-network access. Remote runners need HTTPS and an appropriate HOST setting behind your TLS reverse proxy.
6. Launch a Connected browser test from Trace.

## AI planning

Set MODEL_API_URL to a full OpenAI-compatible `/chat/completions` endpoint, MODEL_API_KEY, and MODEL_NAME. Local models with this protocol are supported; use a nonempty placeholder key for servers that do not require authentication. Only URL, goal, persona, visible control text, and recent action descriptions are sent to the model. Do not include secrets in goals. The planner selects allowed action IDs; it cannot run arbitrary JavaScript. Invalid output and provider errors stop the run visibly.

## Signed-in products

Export a Playwright storage-state file using your dedicated test account and set STORAGE_STATE_PATH to its absolute path. Cookies stay on the runner. Complete MFA yourself before exporting state. Never commit or share this file.

## Boundaries

Only the chosen origin can be navigated. Public assets may load; private/reserved target addresses are rejected. The initial hostname is pinned to its verified DNS answer; each outbound request is checked. Use a network egress firewall for hostile targets: DNS checks alone do not fully isolate third-party resources.

Destructive actions, payments, messages, invitations, publishing and sign-out are excluded. State-changing requests are blocked by default. Set ALLOW_TEST_WRITES=true only for a disposable staging account. Some workflows are deliberately not tested under these boundaries.

Maximum 20 pages, 30 model decisions, 4 minutes, 30 findings and 5 screenshots; one run at a time. The default page budget is 5. The planner selects clicks, scrolls or finishing. Arbitrary text entry and complete form submission are not implemented. Accessibility checks are focused heuristics, not a full audit. No agent can guarantee finding every possible bug.

Jobs are held in runner memory; Trace saves reports after polling. Keep the app tab open until completion. Reconnect after a refresh; connection tokens remain in tab memory only.

API: GET /health, POST /runs, GET /runs/:id, DELETE /runs/:id. Every request requires `Authorization: Bearer <TRACE_RUNNER_TOKEN>`. Browser requests require an exact allowed Origin. Never expose the runner without TLS and authentication.

Reference: [Playwright Page API](https://playwright.dev/docs/api/class-page).

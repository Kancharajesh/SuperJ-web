# Browser automation agent

A minimal coding/automation agent, originally built around Google's
**free-tier** Gemini API (`gemini-3.8-flash`). It's
a small manual tool-calling loop, not a framework: pick a provider with
`AI_PROVIDER=gemini|claude|openai` in `.env`; see `providers/`.

## OpenAI browser robot

Requires Node.js 20+, an OpenAI API key, and API billing. The implementation
uses the [Responses API with function calling](https://developers.openai.com/api/docs/guides/function-calling)
through native fetch, with `gpt-5.4-mini` as the configurable default.

Install the agent dependencies and browser from the repository root:

```bash
npm --prefix agent install
cd agent
npx playwright install chromium
```

Add these values to `agent/.env` (preserve existing settings):

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5.4-mini
BROWSER_HEADLESS=false
```

From the repository root, run:

```bash
npm run test:robot
# Or describe your own scenario:
npm run test:robot -- "Open the login page and verify validation for an empty phone number"
```

The default scenario covers login → Home → Wallet → Profile → cancel logout.
It loads `BASE_URL`, `PHONE_NUMBER`, and `OTP_CODES` from the root `.env`, with
`agent/.env` and exported environment variables taking precedence. Use
`BROWSER_HEADLESS=false` to watch it, or `true` for background execution.
The robot always uses OpenAI, independent of `AI_PROVIDER`.

The model selects browser actions from page text and controls; it does not
use screenshot-based computer vision. Its tools are limited to browsing and
submitting a test result (no shell or file access). JSON reports go to
`agent/run-logs/robot-*.json`, with checks, observed evidence, and action names.
Failed, blocked, incomplete, and configuration-error runs exit nonzero.
Pass/fail judgments are model-generated; retain the deterministic Playwright
suite for regression checks. Test-account details and page observations are
sent to OpenAI; credentials are removed from saved reports and tool arguments
are not printed by the robot.

For the general coding REPL, set `AI_PROVIDER=openai` and run `npm start` from
`agent/`. That mode retains the existing shell/file tools. The existing scheduled
script still selects Claude; adding OpenAI does not change scheduled runs.

Without an OpenAI API key, run `npm test` from the repository root for the
existing Playwright suite. Validate the OpenAI adapter without API calls with
`npm --prefix agent test`.

Unrelated to the Playwright test suite elsewhere in this repo — this is a
separate, standalone Node project.

## MCP servers

The REPL and `--once` mode (not `test:robot`) can use tools from any
[MCP](https://modelcontextprotocol.io) server, with every provider. It's opt-in:

```bash
cp mcp.example.json mcp.json   # gitignored; edit to taste
npm start                      # prints "MCP: <name> connected (N tools)"
```

`mcp.json` uses the same `mcpServers` shape as Claude Code / Claude Desktop:

- stdio: `{"command": "npx", "args": [...], "env": {...}, "cwd": "..."}`
- remote (Streamable HTTP): `{"url": "https://...", "headers": {...}}`
- optional on either: `"allowedTools": ["a", "b"]` to expose only those, and
  `"disabled": true`
- `${VAR}` in `url`, `args`, `env` and `headers` is filled from the environment
  (including `.env`), so tokens stay out of `mcp.json`

Tools appear to the model as `mcp__<server>__<tool>`. A server that fails to
start is skipped with a warning; the agent still runs. Point elsewhere with
`MCP_CONFIG=/path/to/file.json`.

Things to know:

- stdio servers get only a minimal environment (`PATH`, `HOME`, ...) plus
  what their `env` block names — not the agent's API keys.
- MCP tools are **not** sandboxed like `read_file`/`browser_*`: a server can
  touch whatever it's built to (e.g. the example `filesystem` server is scoped
  to `.` by its argument, not by this agent). Scheduled runs load `mcp.json`
  too, and run unattended — keep `allowedTools` tight.
- `npm run test:robot` never loads MCP servers; its tools stay browser-only.

## What it can do

Four tools, all sandboxed to this folder (`agent/`), where it's run from:

- `read_file` / `write_file` / `list_dir` — file operations
- `run_shell` — run any shell command (tests, git, etc.)

It's a REPL: it remembers the conversation across turns in the same session.

## Setup

```bash
cd agent
npm install                # already done if you're reading this after setup
cp .env.example .env
```

Get a free API key at **https://aistudio.google.com/apikey** (no payment
method required for the free tier) and paste it into `.env`.

To use Claude instead (paid, but far more reliable for multi-step tool use —
see "Known limitations" below), set `AI_PROVIDER=claude` and
`ANTHROPIC_API_KEY` in `.env` (key from
https://console.anthropic.com/settings/keys).

## Run

```bash
npm start
```

```
Provider: gemini (model: gemini-3.8-flash)
Working directory: /Users/you/SuperJ-web/agent
Type a request, or 'exit' to quit.

> create a file called notes.txt with "hello world" in it
  -> write_file({"path":"notes.txt","content":"hello world"})

Done — created notes.txt with "hello world".
```

## Scheduled test runs (launchd, 09:00 & 18:00 daily)

`run-scheduled.sh` is registered as a launchd LaunchAgent
(`~/Library/LaunchAgents/com.superj.agent.testflow.plist`) that fires daily at
9am and 6pm. Each run:

1. Runs the existing Playwright spec suite (`../tests/*.spec.js`) as plain
   bash — deterministic, not driven by the LLM — then has the agent read the
   log and write `run-logs/summary-<timestamp>.md`.
2. Has the agent drive a real headless browser (`browser_navigate`,
   `browser_snapshot`, `browser_click`, `browser_fill`, `browser_go_back` —
   see `browser-tools.js`) against **production** `superj.app` to find and
   complete one flow that has no written spec yet, logging in with the same
   test account (`PHONE_NUMBER`/`OTP_CODES` from the repo root `.env`) the
   spec suite already uses, and writes findings to
   `run-logs/explore-<timestamp>.md`.

**This is a confirmed, deliberate choice, not an oversight:** step 2 lets an
unsupervised model complete real flows on production — including OTP and
wallet actions — twice a day, with no human reviewing each run before it
acts. The `browser_navigate` tool is origin-locked (can't wander off
`superj.app` to some unrelated site), and `MAX_TOOL_ROUNDS` in `index.js`
caps how many tool calls a single run can make, but nothing stops it from
completing a real flow with real side effects on the test account. Check
`run-logs/explore-*.md` periodically.

The script sets `AI_PROVIDER=claude` for both scheduled steps (needs
`ANTHROPIC_API_KEY` in `.env`) — Gemini's free tier caps at 5 requests/minute,
which was failing the explorer step with a 429 before it got past its first
`browser_snapshot`.

To pause the schedule: `launchctl bootout gui/$(id -u)/com.superj.agent.testflow`.
To remove it entirely: also `rm ~/Library/LaunchAgents/com.superj.agent.testflow.plist`.

## Known limitations / things to know before relying on this

- **Free tier means rate-limited and may be used to improve Google's
  products** (per Gemini's free-tier terms) — don't paste secrets or
  proprietary code into it. Check current limits at
  https://ai.google.dev/gemini-api/docs/rate-limits before heavy use.
- **`run_shell` executes whatever the model decides to run**, restricted only
  to this folder as the working directory — it is not sandboxed beyond that.
  The system prompt asks the model to flag destructive commands before
  running them, but that's a prompting convention, not an enforced
  permission gate (unlike Claude Code's actual permission system). Don't
  point this at a folder you wouldn't feel safe running arbitrary shell
  commands in.
- **Quality**: `gemini-3.8-flash` is fast and free, but noticeably less
  reliable at multi-step agentic coding than a frontier paid model (Claude,
  GPT), and its free tier caps out at 5 requests/minute — often not enough
  for a long tool-calling session. Switch to `AI_PROVIDER=claude` for
  anything that needs to reliably finish (this is what the scheduled runs
  use).
- This uses Gemini's newer **Interactions API** (`client.interactions.create`,
  chained via `previous_interaction_id`) rather than the older
  `generateContent` — current as of when this was written; if the SDK
  errors on that call, check https://ai.google.dev/gemini-api/docs for
  what's current.

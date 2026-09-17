# Free Gemini Agent

A minimal coding/automation agent that runs entirely on Google's **free-tier**
Gemini API (`gemini-3.8-flash`) — no Anthropic/OpenAI cost. It's a small
manual tool-calling loop, not a framework: ~150 lines total, easy to read and
extend.

Unrelated to the Playwright test suite elsewhere in this repo — this is a
separate, standalone Node project.

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

## Run

```bash
npm start
```

```
Free coding agent ready (model: gemini-3.8-flash)
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
unsupervised free-tier model complete real flows on production — including
OTP and wallet actions — twice a day, with no human reviewing each run before
it acts. The `browser_navigate` tool is origin-locked (can't wander off
`superj.app` to some unrelated site), and `MAX_TOOL_ROUNDS` in `index.js`
caps how many tool calls a single run can make, but nothing stops it from
completing a real flow with real side effects on the test account. Check
`run-logs/explore-*.md` periodically.

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
  GPT). Expect more retries on complex tasks.
- This uses Gemini's newer **Interactions API** (`client.interactions.create`,
  chained via `previous_interaction_id`) rather than the older
  `generateContent` — current as of when this was written; if the SDK
  errors on that call, check https://ai.google.dev/gemini-api/docs for
  what's current.

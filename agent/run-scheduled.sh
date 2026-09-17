#!/bin/bash
# Scheduled test run: launchd invokes this at 09:00 and 18:00 daily.
#
# Two steps:
#   1. Run the existing Playwright spec suite as plain bash (deterministic,
#      no LLM in that loop) then have the agent summarize the log.
#   2. Have the agent drive a real browser (browser_* tools) against
#      production to exercise flows that have no written spec yet, using the
#      same test account (PHONE_NUMBER/OTP_CODES from the repo's .env) the
#      spec suite already uses. This step can complete real flows — OTP,
#      wallet actions — on production, unsupervised. That's an explicit,
#      confirmed choice, not an oversight: see agent/README.md.
set -uo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

REPO_ROOT="/Users/rajesh/SuperJ-web"
AGENT_DIR="$REPO_ROOT/agent"
LOG_DIR="$AGENT_DIR/run-logs"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M")"

mkdir -p "$LOG_DIR"

# Pull BASE_URL / PHONE_NUMBER / OTP_CODES so the explorer step below uses the
# same test account and origin lock as the existing spec suite.
set -a
source "$REPO_ROOT/.env"
set +a

cd "$REPO_ROOT"
npx playwright test --reporter=list > "$LOG_DIR/playwright-$TIMESTAMP.log" 2>&1
TEST_EXIT=$?

cd "$AGENT_DIR"
node index.js --once "A scheduled Playwright run for the SuperJ login/wallet/profile flow just finished with exit code $TEST_EXIT. Read run-logs/playwright-$TIMESTAMP.log (list run-logs/ first if unsure of the exact name) and write a short pass/fail summary — which specs passed, which failed and why — to run-logs/summary-$TIMESTAMP.md." \
  >> "$LOG_DIR/agent-$TIMESTAMP.log" 2>&1

node index.js --once "Using browser_navigate/browser_snapshot/browser_click/browser_fill, explore ${BASE_URL} for a flow NOT already covered by the existing Playwright specs (see ../tests/*.spec.js and ../pages/*.js in the repo for what's already covered: welcome/login, profile, wallet, api, and their mobile variants). Log in with phone number ${PHONE_NUMBER} and OTP code ${OTP_CODES%%,*} if needed (this is the project's designated test account). Pick one uncovered flow, complete it end to end, and write what you found to run-logs/explore-$TIMESTAMP.md: what flow you tested, the steps you took, whether it worked, and anything broken or unexpected. If everything you find is already covered by the existing specs, say so instead of guessing." \
  >> "$LOG_DIR/agent-explore-$TIMESTAMP.log" 2>&1

exit $TEST_EXIT

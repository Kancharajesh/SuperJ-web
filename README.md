# SuperJ Playwright Test Project

This project contains Playwright test cases for `https://superj.app` on both desktop and mobile-web.

## Covered test cases

Full-site coverage lives in `tests/site/` and is catalogued, with manual cases and known bugs, in
[TEST_CASES.md](TEST_CASES.md). Run it with `npm run test:site`. It logs in once per layout (the `setup` project)
and reuses that session. The list below describes the original specs in `tests/*.spec.js`.

1. Desktop web: phone/OTP login, wallet cash balance & coupons, profile page (DID, refer, transaction history,
   logout cancel).
2. Mobile web (`Start Now` -> WhatsApp OTP funnel, a separate flow from desktop): login, wallet (cash balance, gift
   cards, coupons), profile page (DID, refer, transaction history, logout cancel).
3. OTP fallback tries `777777` first, then `711711` on both flows.
4. API traffic capture: every XHR/fetch call made during a full desktop session (login -> Home -> Wallet -> Profile)
   and a full mobile session (login -> Home) is logged to `test-results/**/api-report-*.json`, with a console
   summary of each endpoint, method, status and hit count (`tests/api.spec.js`, `tests/mobile-api.spec.js`).

Not covered: actually confirming logout (both platforms only exercise cancel — confirming would end the session for
the one shared test phone number and break subsequent tests/runs).

Note: `api.superj.app` encrypts every request/response body as `{ iv, data }` (AES ciphertext) — the API report
shows which endpoints are called and their HTTP status, but payload bodies are ciphertext, not readable JSON.

Tests run serially (`workers: 1`) because every spec authenticates the same hardcoded test phone number; running
logins concurrently causes OTP requests to race each other against the real backend.

## Install

```bash
npm install
npx playwright install
```

If browser download is blocked but Chrome/Chromium is already installed, set:

```bash
export CHROME_EXECUTABLE_PATH=/usr/bin/chromium
```

## Configure login

Copy the example environment file:

```bash
cp .env.example .env
```

Default values are already set:

```env
BASE_URL=https://superj.app
PHONE_NUMBER=9885060891
OTP_CODES=777777,711711
```

## Run tests

An optional OpenAI browser robot can explore login, wallet, and profile using
natural-language instructions: `npm run test:robot`. It requires an OpenAI API
key; see [agent setup](agent/README.md#openai-browser-robot). The Playwright
commands below do not require an AI API key.

```bash
npm test
npm run test:desktop
npm run test:mobile
npm run test:site      # full-site suite in tests/site (see TEST_CASES.md)
npm run test:headed
```

## Run a single test file

```bash
npx playwright test tests/site/wallet.spec.js                  # one file
npx playwright test tests/site/wallet.spec.js -g "TC-WAL-05"   # one test by ID
```

## Allure report

Needs Java 8+ on the PATH (the Allure CLI is Java-based).

```bash
npx playwright test --reporter=line,allure-playwright   # or: npm run test:allure
npm run allure:generate                                 # allure-results/ -> allure-report/
npm run allure:open                                     # serve the report in a browser
```

`allure-results/` and `allure-report/` are gitignored. Like the Playwright report, they can contain screenshots of
the logged-in account (including gift-card codes), so don't share them publicly.

## View report

```bash
npm run report
```

## Notes

- `pages/WelcomePage.js` drives the desktop flow (direct phone-number input); `pages/Mobile_login.js` drives the
  distinct mobile-web flow (`Start Now` -> WhatsApp OTP). They are not interchangeable — each project in
  `playwright.config.js` only runs the spec files written for it (`mobile-*.spec.js` -> `mobile-chrome`, everything
  else -> `desktop-chrome`).
- The hashed CSS-module class names some locators used (e.g. `CashBalanceComponent-module__xUC3AW__container`)
  changed and broke `pages/Wallet.js` and `pages/Mobile_wallet.js`. Those now use visible text and hrefs. Prefer
  text/role locators for anything new. `pages/Profile.js` still has positional `(//div)[N]` locators that will break
  on layout changes.
- Mobile buttons and links sit under an invisible `<input switch>` overlay, so Playwright's normal `click()` times
  out even though real taps work. Use `tap()` from `utils/ui.js`. See the maintainer notes in
  [TEST_CASES.md](TEST_CASES.md).

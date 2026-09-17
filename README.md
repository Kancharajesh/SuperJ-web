# SuperJ Playwright Test Project

This project contains Playwright test cases for `https://superj.app` on both desktop and mobile-web.

## Covered test cases

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

```bash
npm test
npm run test:desktop
npm run test:mobile
npm run test:headed
```

## View report

```bash
npm run report
```

## Notes

- `pages/WelcomePage.js` drives the desktop flow (direct phone-number input); `pages/Mobile_login.js` drives the
  distinct mobile-web flow (`Start Now` -> WhatsApp OTP). They are not interchangeable — each project in
  `playwright.config.js` only runs the spec files written for it (`mobile-*.spec.js` -> `mobile-chrome`, everything
  else -> `desktop-chrome`).
- Several locators in `pages/Profile.js`/`pages/Wallet.js`/`pages/Mobile_wallet.js` key off Next.js CSS-module class
  names (e.g. `CashBalanceComponent-module__xUC3AW__container`). These are content hashes, not random per-deploy
  values — they held up throughout this session — but they will still change whenever that component's source is
  edited, so if a test starts failing on a locator like that, re-inspect the live DOM rather than assuming the flow
  itself broke.
- Mobile profile locators (`pages/Mobile_profile.js`) are plain visible text (`"My History"`, `"Refer a friend"`,
  etc.) instead of class names, and are more resilient to this kind of churn.

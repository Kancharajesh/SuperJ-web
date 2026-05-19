# SuperJ Playwright Test Project

This project contains Playwright test cases for `https://superj.app` on both desktop and mobile-web.

## Covered test cases

1. Homepage loads on desktop and mobile-web.
2. Homepage has visible content.
3. Homepage has no critical console errors.
4. Login opens and authenticates with phone number `9885060891`.
5. OTP fallback tries `777777` first, then `711711`.
6. Session remains after page reload.
7. Responsive layout does not create horizontal overflow.
8. Primary interactive controls are reachable.

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

The login helpers are written with flexible selectors because the environment used to create this package could not open the live site in a browser. If a login selector changes, update `utils/auth.js` after running locally in headed mode.

# SuperJ API Testing Guide

Complete guide to understanding and testing SuperJ APIs through automated flow testing and network monitoring.

---

## 📋 Overview

This guide provides:
1. **API Flow Mapping Test** - Captures all network requests during user flows
2. **API Endpoints Reference** - Complete documentation of all API endpoints
3. **Testing Instructions** - How to run tests and analyze API behavior
4. **Real-World Examples** - Request/response examples from actual flows

---

## 🎯 What This Solves

✅ **Understand API Calls** - Know which APIs are called for each user action
✅ **Model Endpoints** - Document which models/endpoints handle which data
✅ **Response Validation** - Verify API responses match expectations
✅ **Flow Testing** - Test complete user journeys end-to-end
✅ **Performance** - Monitor API response times
✅ **Error Handling** - Capture and analyze error scenarios

---

## 🚀 Quick Start

### Run the API Flow Mapping Test

```bash
# Run all API flow mapping tests
npx playwright test tests/api-flow-mapping.spec.js

# Run specific test step
npx playwright test tests/api-flow-mapping.spec.js -g "Step 3"

# Run with visible output
npx playwright test tests/api-flow-mapping.spec.js --headed

# Generate HTML report
npm run report
```

### What Gets Captured

When you run the test, it automatically:
1. ✅ Logs every API request (method, URL, payload)
2. ✅ Logs every API response (status, data)
3. ✅ Creates a complete flow map
4. ✅ Documents request/response pairs
5. ✅ Validates all responses succeed (status 200-299)

---

## 📊 API Test Steps

### Step 1: Launch Application
**Tests:** Home page loads and all initial APIs complete

**APIs Captured:**
- User preference loading
- Initial data fetching
- Banner/promotional content
- Survey feed initialization

**Expected Endpoints:**
- `/api/user/preferences`
- `/api/home/feed`
- `/api/banners`

---

### Step 2: Login Flow
**Tests:** OTP request and verification

**Sub-steps:**
- A) Request OTP → `/api/auth/requestOtp`
- B) Verify OTP → `/api/auth/verifyOtp`

**Payloads:**
```
Request OTP:
{
  "phoneNumber": "+919876543210",
  "countryCode": "IN"
}

Verify OTP:
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "deviceId": "device-id"
}
```

**Expected Responses:**
```
Success (200):
{
  "success": true,
  "token": "jwt-token",
  "user": { ... },
  "sessionExpiry": 2592000
}
```

---

### Step 3: Navigate to Wallet
**Tests:** All wallet-related APIs load

**APIs Captured:**
- `/api/wallet/balance` → Get current balance
- `/api/wallet/giftcards` → Fetch available gift cards
- `/api/wallet/rules` → Cash-out rules
- `/api/notifications` → Any alerts/notifications

**Typical Flow:**
1. User clicks "Wallet" in bottom navigation
2. Page navigates to `/rewards` route
3. Simultaneous API calls:
   - GET `/api/wallet/balance` (priority)
   - GET `/api/wallet/giftcards` (priority)
   - GET `/api/wallet/cashout-rules` (lower priority)

**Sample Response (Balance):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "balance": 1250,
    "currency": "INR",
    "cashOutMinimum": 250,
    "canCashOut": true,
    "lastUpdated": "2026-10-08T14:30:00Z"
  }
}
```

---

### Step 4: Verify Cash Balance
**Tests:** Balance API and amount display

**API Called:**
- Method: `GET`
- Endpoint: `/api/wallet/balance`
- Auth: JWT token required

**Response Fields:**
```
{
  "balance": 1250,           # Current balance in INR
  "currency": "INR",         # Currency type
  "cashOutMinimum": 250,    # Minimum needed to cash out
  "canCashOut": true,       # Permission check
  "lastUpdated": "...",     # Last updated timestamp
  "pending": 0              # Pending transactions
}
```

**Test Validation:**
```
✓ Status code is 200
✓ Balance is a number > 0
✓ Currency is "INR"
✓ cashOutMinimum > 0
✓ lastUpdated is valid timestamp
```

---

### Step 5: Verify Gift Cards
**Tests:** Gift card listing and data

**API Called:**
- Method: `GET`
- Endpoint: `/api/wallet/giftcards`
- Query: `?userId=USER_ID&status=available&limit=20`
- Auth: JWT token required

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "giftcards": [
      {
        "id": "gc_123",
        "brand": "Amazon",
        "amount": 500,
        "expiryDate": "2026-12-31",
        "code": "XXXX-XXXX-XXXX-1234",
        "pin": "****",
        "status": "available"
      },
      {
        "id": "gc_124",
        "brand": "Flipkart",
        "amount": 750,
        "expiryDate": "2027-01-31",
        "code": "XXXX-XXXX-XXXX-5678",
        "pin": "****",
        "status": "available"
      }
    ],
    "total": 2,
    "totalAmount": 1250
  }
}
```

**Test Validation:**
```
✓ Status code is 200
✓ Response contains array of gift cards
✓ Each gift card has: id, brand, amount, expiryDate
✓ Codes/PINs are masked (security)
✓ Status is "available" for all
✓ Total amount matches sum of individual amounts
```

---

## 🔄 Complete Mobile Wallet Flow

Here's the full sequence of API calls for the mobile wallet feature:

```
1. Launch App
   ├─ GET /api/config (app configuration)
   ├─ GET /api/app-version (version check)
   └─ GET /api/home/feed (survey list)

2. Login Flow
   ├─ POST /api/auth/requestOtp
   │  └─ Response: { success: true, expiresIn: 300 }
   ├─ POST /api/auth/verifyOtp
   │  └─ Response: { success: true, token: "jwt", user: {...} }
   └─ POST /api/user/session (create session)

3. Navigate to Wallet (/rewards route)
   ├─ GET /api/wallet/balance
   │  └─ Response: { balance: 1250, cashOutMinimum: 250 }
   ├─ GET /api/wallet/giftcards?status=available
   │  └─ Response: { giftcards: [...], total: 2 }
   ├─ GET /api/wallet/cashout-rules
   │  └─ Response: { minimum: 250, maximum: 50000 }
   └─ GET /api/notifications?userId=xxx
      └─ Response: { notifications: [...] }

4. User Actions
   ├─ View Balance
   │  └─ GET /api/wallet/balance (cached, may not call again)
   ├─ Click Gift Card
   │  └─ POST /api/wallet/giftcard/{id}/view (log view)
   ├─ Copy Code
   │  └─ POST /api/wallet/giftcard/{id}/copy (log action)
   └─ Cash Out
      └─ POST /api/wallet/cashout { amount, method }
```

---

## 📈 API Performance Metrics

### Expected Response Times (99th percentile)

| Endpoint | Response Time | Notes |
|----------|---------------|-------|
| `/auth/requestOtp` | < 1s | May hit rate limits |
| `/auth/verifyOtp` | < 1s | Validate against server |
| `/wallet/balance` | < 500ms | Should be fast |
| `/wallet/giftcards` | < 1s | May have many items |
| `/wallet/cashout-rules` | < 500ms | Static content |
| `/transactions` | < 1s | Paginated response |
| `/surveys` | < 1s | Paginated response |

---

## 🐛 Debugging API Issues

### Check Network Requests in Browser

1. **Open DevTools** → `F12` or right-click → Inspect
2. **Go to Network tab**
3. **Filter to "Fetch/XHR"**
4. **Look for `/api/` requests**
5. **Click request to see:**
   - Headers (auth token, user-agent)
   - Request body (JSON payload)
   - Response (status, data)
   - Timing (when it was called, how long)

### Common Issues & Fixes

**Issue: 401 Unauthorized**
```
Cause: JWT token expired or invalid
Fix: Re-run auth flow to get new token
```

**Issue: 429 Too Many Requests**
```
Cause: Rate limit hit (e.g., 5 OTP requests/hour)
Fix: Wait for rate limit window to reset
```

**Issue: 400 Bad Request**
```
Cause: Invalid payload or missing fields
Fix: Check request format matches API spec
```

**Issue: 500 Server Error**
```
Cause: Server-side issue
Fix: Wait 5-10 minutes and retry, or contact support
```

---

## 📝 API Test Examples

### Example 1: Test Balance Retrieval

```javascript
test("Wallet Balance API", async ({ page }) => {
  let balanceResponse = null;

  page.on("response", (response) => {
    if (response.url().includes("/wallet/balance")) {
      balanceResponse = response;
    }
  });

  await page.goto("https://superj.app/rewards");
  await page.waitForTimeout(2000);

  expect(balanceResponse.status()).toBe(200);

  const data = await balanceResponse.json();
  expect(data.success).toBe(true);
  expect(data.data.balance).toBeGreaterThan(0);
  expect(data.data.currency).toBe("INR");
});
```

### Example 2: Test Gift Cards Pagination

```javascript
test("Gift Cards Pagination", async ({ page }) => {
  const responses = [];

  page.on("response", async (response) => {
    if (response.url().includes("/wallet/giftcards")) {
      responses.push(await response.json());
    }
  });

  await page.goto("https://superj.app/rewards");

  // Initial load
  await page.waitForTimeout(1000);
  expect(responses[0].data.giftcards.length).toBeGreaterThan(0);

  // Click "See More" to load more
  await page.click("button:has-text('See More')");
  await page.waitForTimeout(1000);

  // Should have more items now
  expect(responses[1].data.giftcards.length).toBeGreaterThan(
    responses[0].data.giftcards.length
  );
});
```

---

## 🔐 Security Considerations

### 1. Authentication
- Always include JWT token in `Authorization` header
- Tokens expire after 30 days
- Handle 401 responses by re-authenticating

### 2. Sensitive Data
- Gift card codes/PINs are masked in responses
- Never log full codes or PINs
- Use HTTPS only (never HTTP)

### 3. Rate Limiting
- OTP: 5 per phone per hour
- Failed OTP: 5 attempts, then 1-hour lockout
- General API: 1000 calls per hour per user

### 4. Validation
- Always verify SSL certificates
- Validate response status codes
- Check error messages for security implications

---

## 📊 API Response Patterns

### Success Response Pattern
```json
{
  "success": true,
  "data": {
    // Actual response data here
  },
  "timestamp": "2026-10-08T15:00:00Z"
}
```

### Error Response Pattern
```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION_FAILED",
    "message": "Invalid phone number",
    "details": {
      "field": "phoneNumber",
      "reason": "format_invalid"
    }
  },
  "timestamp": "2026-10-08T15:00:00Z"
}
```

### Paginated Response Pattern
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true,
    "nextOffset": 20
  }
}
```

---

## 📚 Related Documentation

- **`API_ENDPOINTS_REFERENCE.md`** - Complete endpoint specifications
- **`tests/api-flow-mapping.spec.js`** - Automated flow tests
- **`tests/mobile-wallet.spec.js`** - Wallet UI tests
- **`TEST_COVERAGE_ANALYSIS.html`** - Test coverage report

---

## ✅ Checklist: Testing a New Feature

When adding a new feature, verify these API aspects:

- [ ] Identify all API endpoints the feature uses
- [ ] Document request format and response structure
- [ ] Test successful response (status 200)
- [ ] Test error responses (invalid input, unauthorized, etc.)
- [ ] Verify response times are acceptable
- [ ] Check rate limiting doesn't affect feature
- [ ] Ensure error messages are helpful
- [ ] Verify sensitive data is masked in logs
- [ ] Test offline behavior (if applicable)
- [ ] Add integration test to api-flow-mapping.spec.js

---

## 🎓 Learning Resources

### To understand the wallet flow better:
1. Read `API_ENDPOINTS_REFERENCE.md` sections 3-6
2. Run `tests/api-flow-mapping.spec.js`
3. Monitor network tab while using the app
4. Check `test-results/` for failed test details

### To add new API tests:
1. Create new test in `tests/api-flow-mapping.spec.js`
2. Use `page.on("request")` to capture calls
3. Use `page.on("response")` to capture responses
4. Log endpoints and payloads
5. Validate response status and structure

---

## 🚨 Troubleshooting

### Tests hang waiting for API
```bash
# Increase timeout
npx playwright test tests/api-flow-mapping.spec.js --timeout=60000
```

### Can't see API requests
```bash
# Run test in headed mode
npx playwright test tests/api-flow-mapping.spec.js --headed
# Open DevTools (F12) → Network tab
```

### Rate limit errors
```bash
# Use different test phone numbers
# Check .env for PHONE_NUMBER config
# Wait 1 hour for OTP limit to reset
```

### Need to inspect API response
```javascript
// Add to test
page.on("response", async (response) => {
  const data = await response.json();
  console.log("API Response:", JSON.stringify(data, null, 2));
});
```

---

## 📞 Support

For API issues:
1. Check `API_ENDPOINTS_REFERENCE.md` for expected format
2. Verify authentication token is valid
3. Check rate limit headers in response
4. Review error code and message for hints
5. Check network tab for actual request/response

---

**Last Updated:** 2026-10-08\
**API Version:** 1.0\
**Guide Version:** 1.0

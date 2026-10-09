# SuperJ API Endpoints Reference

## Overview

This document maps all API endpoints used by the SuperJ mobile and desktop applications during various user flows.

---

## API Base URL

```
https://superj.app/api
```

All requests use JSON format with appropriate headers for authentication.

---

## Authentication Endpoints

### 1. Request OTP
**Endpoint:** `POST /api/auth/requestOtp`

**Purpose:** Request One-Time Password for phone number authentication

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "countryCode": "IN"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "deliveryMethod": "whatsapp"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**Status Codes:**
- 200: OTP sent successfully
- 429: Too many requests
- 400: Invalid phone number

---

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verifyOtp`

**Purpose:** Verify OTP and create user session

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "deviceId": "unique-device-id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "phoneNumber": "+919876543210",
    "did": "did:zkjm:superj:abc123...",
    "isNewUser": false,
    "createdAt": "2026-09-15T10:30:00Z"
  },
  "sessionExpiry": 2592000
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid OTP",
  "attemptsRemaining": 2
}
```

**Status Codes:**
- 200: Verified successfully, session created
- 401: Invalid OTP
- 429: Too many failed attempts (lockout)

---

## Wallet Endpoints

### 3. Get Wallet Balance
**Endpoint:** `GET /api/wallet/balance`

**Purpose:** Fetch current wallet balance and account details

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
```
userId={userId}
currency=INR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "balance": 1250,
    "currency": "INR",
    "lastUpdated": "2026-10-08T14:30:00Z",
    "pending": 0,
    "cashOutMinimum": 250,
    "canCashOut": true
  }
}
```

**Status Codes:**
- 200: Balance retrieved successfully
- 401: Unauthorized
- 404: User not found

---

### 4. Get Gift Cards
**Endpoint:** `GET /api/wallet/giftcards`

**Purpose:** Fetch available gift cards for the user

**Query Parameters:**
```
userId={userId}
status=available
sortBy=expiry_date
limit=20
offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "giftcards": [
      {
        "id": "gc_123",
        "brand": "Amazon",
        "amount": 500,
        "currency": "INR",
        "expiryDate": "2026-12-31",
        "redemptionUrl": "https://amazon.in/redeem",
        "code": "XXXX-XXXX-XXXX-1234",
        "pin": "****",
        "status": "available",
        "earnedOn": "2026-10-01T10:00:00Z"
      },
      {
        "id": "gc_124",
        "brand": "Flipkart",
        "amount": 750,
        "currency": "INR",
        "expiryDate": "2027-01-31",
        "redemptionUrl": "https://flipkart.com/redeem",
        "code": "XXXX-XXXX-XXXX-5678",
        "pin": "****",
        "status": "available",
        "earnedOn": "2026-10-05T15:20:00Z"
      }
    ],
    "total": 2,
    "totalAmount": 1250
  }
}
```

**Status Codes:**
- 200: Gift cards retrieved
- 401: Unauthorized
- 404: User not found

---

### 5. Copy Gift Card Code
**Endpoint:** `POST /api/wallet/giftcard/{id}/copy`

**Purpose:** Copy gift card code/PIN to clipboard (logs action)

**Path Parameters:**
```
id: Gift card ID (gc_123)
```

**Request:**
```json
{
  "giftcardId": "gc_123",
  "codePart": "code" // or "pin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code copied",
  "expiryNotice": "Expires in 85 days"
}
```

**Status Codes:**
- 200: Code copied and logged
- 401: Unauthorized
- 404: Gift card not found

---

### 6. Cash Out Request
**Endpoint:** `POST /api/wallet/cashout`

**Purpose:** Request cash withdrawal to bank account or redeem gift card

**Request:**
```json
{
  "amount": 500,
  "method": "bank_transfer", // or "gift_card"
  "bankAccount": {
    "accountNumber": "****1234",
    "ifscCode": "HDFC0000123"
  },
  "giftCardId": null
}
```

**Response (Success):**
```json
{
  "success": true,
  "transaction": {
    "id": "txn_456",
    "userId": "user_123",
    "amount": 500,
    "status": "processing",
    "method": "bank_transfer",
    "createdAt": "2026-10-08T14:35:00Z",
    "estimatedCompletion": "2026-10-10T18:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient balance",
  "currentBalance": 150,
  "minimumRequired": 250
}
```

**Status Codes:**
- 200: Cash out successful
- 400: Validation error (amount, minimum not met)
- 401: Unauthorized
- 403: Account not verified

---

## Survey Endpoints

### 7. Get Surveys List
**Endpoint:** `GET /api/surveys`

**Purpose:** Fetch list of available surveys for the user

**Query Parameters:**
```
userId={userId}
status=available
category=all
sortBy=reward
limit=10
offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "surveys": [
      {
        "id": "survey_789",
        "title": "Customer Satisfaction Survey",
        "description": "Help us improve our services",
        "reward": 150,
        "currency": "INR",
        "estimatedTime": 5,
        "questionCount": 10,
        "category": "customer_feedback",
        "difficulty": "easy",
        "participantCount": 1250,
        "status": "active",
        "imageUrl": "https://..."
      }
    ],
    "total": 15,
    "totalRewards": 2250
  }
}
```

---

### 8. Get Survey Details
**Endpoint:** `GET /api/surveys/{id}`

**Purpose:** Fetch detailed survey information with questions

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "survey_789",
    "title": "Customer Satisfaction Survey",
    "description": "...",
    "questions": [
      {
        "id": "q1",
        "type": "rating",
        "text": "How satisfied are you with our service?",
        "options": ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
      },
      {
        "id": "q2",
        "type": "multiple_choice",
        "text": "Which features did you use?",
        "options": ["Feature A", "Feature B", "Feature C", "Feature D"]
      }
    ],
    "reward": 150,
    "timeEstimate": 5
  }
}
```

---

### 9. Submit Survey Response
**Endpoint:** `POST /api/surveys/{id}/submit`

**Purpose:** Submit survey answers and earn reward

**Request:**
```json
{
  "surveyId": "survey_789",
  "userId": "user_123",
  "responses": [
    {
      "questionId": "q1",
      "answer": "Very Satisfied"
    },
    {
      "questionId": "q2",
      "answer": ["Feature A", "Feature C"]
    }
  ],
  "completedAt": "2026-10-08T14:45:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "reward": {
    "amount": 150,
    "currency": "INR",
    "credited": true,
    "creditedAt": "2026-10-08T14:45:30Z"
  },
  "transaction": {
    "id": "txn_reward_123",
    "type": "survey_completion",
    "status": "completed"
  }
}
```

---

## Transaction History Endpoints

### 10. Get Transactions
**Endpoint:** `GET /api/transactions`

**Purpose:** Fetch user's transaction history

**Query Parameters:**
```
userId={userId}
type=all // survey_completion, cash_out, gift_card_purchase
sortBy=date_desc
limit=20
offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_survey_001",
        "type": "survey_completion",
        "description": "Survey: Customer Satisfaction",
        "amount": 150,
        "currency": "INR",
        "date": "2026-10-08T14:45:00Z",
        "status": "completed",
        "surveyId": "survey_789"
      },
      {
        "id": "txn_reward_transfer",
        "type": "cash_out",
        "description": "Cash out to bank account",
        "amount": -500,
        "currency": "INR",
        "date": "2026-10-05T10:00:00Z",
        "status": "completed",
        "reference": "TXN123456"
      }
    ],
    "total": 45,
    "netBalance": 1250
  }
}
```

---

## Profile Endpoints

### 11. Get User Profile
**Endpoint:** `GET /api/user/profile`

**Purpose:** Fetch complete user profile information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phoneNumber": "+919876543210",
    "email": "user@example.com",
    "did": "did:zkjm:superj:abc123def456...",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "gender": "Male",
      "birthYear": 1992,
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India"
    },
    "account": {
      "createdAt": "2026-09-15T10:30:00Z",
      "verificationStatus": "verified",
      "kycStatus": "verified"
    }
  }
}
```

---

### 12. Update User Profile
**Endpoint:** `POST /api/user/profile`

**Purpose:** Update user profile information

**Request:**
```json
{
  "email": "newemail@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "birthYear": 1992,
    "city": "Bangalore"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_123",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "updatedAt": "2026-10-08T15:00:00Z"
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "fieldName",
      "reason": "validation_failed"
    }
  },
  "timestamp": "2026-10-08T15:00:00Z"
}
```

---

## Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| ERR_AUTH_FAILED | 401 | Authentication failed |
| ERR_AUTH_EXPIRED | 401 | Session expired |
| ERR_PERMISSION_DENIED | 403 | User doesn't have permission |
| ERR_VALIDATION_FAILED | 400 | Invalid input data |
| ERR_RATE_LIMIT | 429 | Too many requests |
| ERR_SERVER_ERROR | 500 | Server error |
| ERR_NOT_FOUND | 404 | Resource not found |
| ERR_CONFLICT | 409 | Resource conflict |

---

## Authentication Headers

All authenticated requests should include:

```
Authorization: Bearer {jwt_token}
X-Device-ID: {unique_device_id}
X-App-Version: 1.0.0
X-Platform: mobile|web
```

---

## Rate Limiting

- **OTP Requests:** 5 per phone number per hour
- **Failed OTP Attempts:** 5 per session, then 1-hour lockout
- **API Calls:** 1000 per user per hour
- **Sensitive Operations:** 10 per day (cash outs, profile updates)

---

## Response Headers

```
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2026-10-08T16:00:00Z
Cache-Control: no-cache, no-store, must-revalidate
Vary: Authorization
```

---

## Testing the APIs

### Using cURL

```bash
# Request OTP
curl -X POST https://superj.app/api/auth/requestOtp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","countryCode":"IN"}'

# Verify OTP
curl -X POST https://superj.app/api/auth/verifyOtp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","otp":"123456","deviceId":"device123"}'

# Get Wallet Balance
curl -X GET "https://superj.app/api/wallet/balance?userId=user_123&currency=INR" \
  -H "Authorization: Bearer {token}"
```

### Using Playwright (in tests)

See `tests/api-flow-mapping.spec.js` for comprehensive examples of capturing and logging API calls.

---

## API Response Times

**Target SLA (99th percentile):**

- Auth endpoints: < 1s
- Wallet endpoints: < 500ms
- Survey endpoints: < 1s
- Transaction endpoints: < 1s
- Profile endpoints: < 500ms

---

## Notes for Developers

1. **JWT Tokens:** Tokens expire after 30 days. Handle 401 responses by re-authenticating.
2. **Offline Mode:** Client should cache last known wallet balance for offline viewing.
3. **Retry Logic:** Implement exponential backoff for failed requests (especially 5xx errors).
4. **Data Privacy:** Gift card codes/PINs are masked in logs. Never log sensitive data.
5. **Verification:** Always verify SSL certificates in production.

---

**Last Updated:** 2026-10-08\
**API Version:** 1.0\
**Documentation:** Complete

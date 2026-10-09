# WhatsApp OTP Automation Setup Guide

**Zero-Touch Automated Testing** - No manual OTP entry required!

---

## 🎯 What This Does

✅ **Automatic OTP Reading** - Reads OTP from WhatsApp automatically
✅ **Full End-to-End Testing** - Login → Wallet → Surveys → Complete flows
✅ **No Manual Steps** - Tests run 100% automatically
✅ **Real-World Testing** - Uses actual WhatsApp OTPs (dynamic, not hardcoded)

---

## 📋 Prerequisites

- ✅ Node.js installed
- ✅ WhatsApp account (on your phone)
- ✅ Chromium-based browser (for WhatsApp Web automation)

---

## 🚀 Setup (First Time Only)

### Step 1: Install Dependencies

```bash
cd /Users/rajesh/SuperJ-web

npm install whatsapp-web.js qrcode-terminal
```

**What these do:**
- `whatsapp-web.js` - Automates WhatsApp Web
- `qrcode-terminal` - Displays QR code for scanning

### Step 2: Setup WhatsApp Connection

```bash
npm run whatsapp:setup
```

**What happens:**
```
🚀 WhatsApp OTP Reader - Test Mode

Initializing WhatsApp connection...

📱 WhatsApp QR Code - Scan with your phone:
   [QR CODE DISPLAYED]

✅ After scanning, wait for authentication...
```

**Follow these steps:**
1. A QR code appears in terminal
2. Take your phone
3. Open WhatsApp
4. Go to **Settings → Linked Devices**
5. Click **"Link a Device"**
6. **Scan the QR code** with your phone camera
7. Wait for "✅ WhatsApp authenticated successfully!"

**That's it!** Session is saved locally. You only need to do this once.

---

## ✅ Test the Setup

After linking:

```bash
# Run test mode to verify OTP reading works
npm run whatsapp:setup

# You'll see:
# ✅ WhatsApp connected!
# Waiting for OTP messages...
# (Send a test message or request OTP from SuperJ app)

# Now request an OTP from the SuperJ app
# The terminal will show:
# 📨 OTP received from superj.app: 123456
# ✅ OTP stored (1 total)
```

Great! Now you're ready to run automated tests.

---

## 🎬 Run Automated Tests

### Quick Test (Login Only)

```bash
npm run test:auto-otp -- -g "Quick Login Test"
```

**What it does:**
1. Opens SuperJ app
2. Enters your phone number
3. Waits for OTP from WhatsApp
4. Automatically reads and enters OTP
5. Completes login
6. Reports success

**Output:**
```
⚡ QUICK LOGIN TEST

📍 Step 1: Launch Application
✅ App loaded

📍 Step 2: Click Start Now
✅ Start Now clicked

📍 Step 3: Enter Phone Number
✅ Phone entered: +919876543210

📍 Step 4: Request OTP (Click Continue)
✅ OTP requested

📍 Step 5: Waiting for OTP from WhatsApp...
   Make sure to request OTP on the app now

📱 WhatsApp OTP Reader - Test Mode
📱 Waiting for OTP from WhatsApp...
   Timeout: 60s

📨 OTP received from superj.app: 123456
✅ OTP received and extracted

📍 Step 6: Enter OTP in Application
✅ OTP entered: 123456

📍 Step 7: Verify Login Successful
✅ Login successful, redirected to Home
```

---

### Full Journey Test (Complete Flow)

```bash
npm run test:auto-otp
```

**What it does:**
1. ✅ Login with automatic OTP reading
2. ✅ Navigate to Wallet
3. ✅ Verify balance loads
4. ✅ Check surveys on Home
5. ✅ View user Profile
6. ✅ Capture API calls
7. ✅ Complete flow report

**Output:**
```
🚀 STARTING AUTOMATED FLOW FOR +919876543210

📍 Step 1: Launch Application
✅ App loaded

📍 Step 2: Click Start Now
✅ Start Now clicked

[... continues through all steps ...]

📍 Step 12: Check User Profile
✅ Profile loaded with DID

======================================================================
🎉 AUTOMATED FLOW COMPLETED SUCCESSFULLY!
======================================================================

📊 Journey Summary:
   ✅ Phone: +919876543210
   ✅ OTP: 123456
   ✅ Login: Success
   ✅ Wallet: Loaded
   ✅ Profile: Loaded
   ✅ API Calls: 8

🕐 Flow completed at: 02:45:30 PM
======================================================================
```

---

## 🎨 Run with Browser Visible

See the test running in real-time:

```bash
npm run test:auto-otp:headed
```

Browser opens and you can watch:
- Text being entered
- OTP being filled automatically
- Pages loading
- API calls happening

---

## 🐛 Debug Mode

For troubleshooting:

```bash
npm run test:auto-otp:debug
```

Opens Playwright Inspector with:
- Step-by-step execution
- Element inspection
- Network monitoring
- Console logs

---

## 📝 Configuration

### Set Your Phone Number

Create or edit `.env` file:

```env
# .env
TEST_PHONE=+919876543210
```

Then use in tests:
```javascript
const PHONE_NUMBER = process.env.TEST_PHONE || "+919876543210";
```

---

## 🔄 Scheduled Automated Testing

Combine with daily scheduler:

```bash
# Run automated tests daily at 9am and 6pm
npm run test:schedule
```

Tests will:
1. Start at scheduled time
2. Automatically read OTP from WhatsApp
3. Complete full flow
4. Log results
5. Repeat at next scheduled time

---

## 🛠️ Troubleshooting

### Problem: "WhatsApp authentication failed"

**Solution:**
```bash
# Delete session and restart
rm -rf .wapi-session/
npm run whatsapp:setup

# Scan QR code again
```

### Problem: "Timeout waiting for OTP"

**Solution:**
```bash
# OTP might not be arriving in WhatsApp
# Check:
1. Is WhatsApp connected? (Should say "✅ WhatsApp client ready!")
2. Did you request OTP in the SuperJ app?
3. Did OTP arrive in WhatsApp? (Check messages)
4. Try increasing timeout:

npm run test:auto-otp -- --timeout=120000
```

### Problem: "WhatsApp disconnected"

**Solution:**
```bash
# Session may have expired
# Restart:
npm run whatsapp:setup

# Or kill process and retry:
pkill -f "whatsapp"
npm run test:auto-otp
```

### Problem: OTP not being read from WhatsApp message

**Solution:**
```javascript
// Check OTP message format in WhatsApp
// Should contain 6 digits: 123456

// Modify whatsapp-otp-reader.js if needed:
const otpMatch = msg.body.match(/\b\d{6}\b/); // Adjust pattern
```

---

## 📊 How It Works (Under the Hood)

```
1. Test starts
   ↓
2. WhatsApp client initialized
   ↓
3. Listens for incoming messages
   ↓
4. App requests OTP
   ↓
5. OTP sent to WhatsApp
   ↓
6. WhatsApp message received
   ↓
7. OTP extracted (regex: \d{6})
   ↓
8. Stored in memory
   ↓
9. Test retrieves OTP
   ↓
10. Test enters OTP in form
   ↓
11. Login completes
   ↓
12. Test continues with next steps
```

---

## 🔐 Security & Privacy

✅ **Your Session:**
- Saved locally in `.wapi-session/` folder
- Never sent to any server
- You can delete anytime: `rm -rf .wapi-session/`

✅ **OTP Codes:**
- Read from WhatsApp messages
- Used immediately
- Not logged or stored permanently
- Never sent anywhere

✅ **Your Phone:**
- WhatsApp Web automation only (browser-based)
- No direct phone access
- No data collection
- Runs locally

---

## 🎯 Use Cases

### 1. Development Testing
```bash
npm run test:auto-otp:headed
# See your flow in browser, OTP entered automatically
```

### 2. Continuous Integration
```bash
npm run test:auto-otp
# Run in CI/CD pipeline, results logged
```

### 3. Scheduled Monitoring
```bash
npm run test:schedule
# Runs daily at 9am and 6pm with auto OTP
```

### 4. Load Testing
```bash
# Multiple test users with automatic OTP reading
for i in {1..5}; do
  TEST_PHONE=$PHONE_$i npm run test:auto-otp &
done
```

---

## 📈 Advanced: Multiple Test Users

```javascript
// tests/multi-user-automation.spec.js

const testUsers = [
  { phone: "+919876543210", name: "User1" },
  { phone: "+919876543211", name: "User2" },
  { phone: "+919876543212", name: "User3" }
];

for (const user of testUsers) {
  test(`Test ${user.name}`, async ({ page }) => {
    const otp = await getOTPFromWhatsApp(user.phone, 60000);
    // ... rest of test
  });
}
```

---

## 📞 Commands Reference

```bash
# Setup
npm run whatsapp:setup              # Link WhatsApp (first time only)

# Testing
npm run test:auto-otp              # Run full automation
npm run test:auto-otp:headed       # Run with browser visible
npm run test:auto-otp:debug        # Debug mode with inspector

# Scheduled
npm run test:schedule              # Daily at 9am & 6pm with auto OTP

# API Testing
npm run test:api-flow              # Regular API tests (no OTP)
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] WhatsApp setup completed (`npm run whatsapp:setup`)
- [ ] QR code scanned on phone
- [ ] Session authenticated ("✅ WhatsApp authenticated!")
- [ ] Test mode passed (OTP received)
- [ ] Automated test runs successfully (`npm run test:auto-otp`)
- [ ] OTP read automatically ✅
- [ ] Login completed ✅
- [ ] Full flow successful ✅

---

## 🎉 Next Steps

1. **First Time:** `npm run whatsapp:setup` and scan QR
2. **Test It:** `npm run test:auto-otp -- -g "Quick Login"`
3. **Run Full Flow:** `npm run test:auto-otp`
4. **Schedule Daily:** `npm run test:schedule`

---

**Ready!** Your tests now run 100% automatically with WhatsApp OTP reading. Zero manual intervention needed! 🚀

---

**Created:** 2026-10-08\
**Version:** 1.0\
**Status:** Production Ready ✅

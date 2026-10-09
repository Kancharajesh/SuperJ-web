# Scheduled Daily Testing - Setup Guide

Run automated tests daily at **9:00 AM** and **6:00 PM** to monitor API health and performance.

---

## 🎯 Three Scheduling Options

Choose the method that works best for your setup:

1. **Node.js Scheduler** (Easiest) - Keep process running
2. **Cron Jobs** (Linux/Mac) - System-level scheduling
3. **GitHub Actions** (Cloud) - Runs in GitHub automatically

---

## Option 1: Node.js Scheduler (Recommended for Development)

### Setup

```bash
# Start the scheduler
npm run test:schedule
```

### What It Does

- ✅ Runs continuously in the foreground
- ✅ Executes tests at 9:00 AM and 6:00 PM
- ✅ Logs all results to `test-logs/` directory
- ✅ Shows countdown to next scheduled run
- ✅ Automatically reschedules for tomorrow after each run

### Output Example

```
======================================================================
🕐 AUTOMATED TEST SCHEDULER STARTED
📅 Today: 10/08/2026, 08:45:30 AM
⏰ Scheduled times: 09:00, 18:00
📁 Log directory: /Users/rajesh/SuperJ-web/test-logs

📋 Upcoming scheduled runs:

   • 09:00 → Next run: 10/08/2026, 09:00:00 AM
   • 18:00 → Next run: 10/08/2026, 06:00:00 PM

⏳ Waiting... Next run in 0h 15m 30s (at 09:00)
```

### Keep It Running (Production)

Use a process manager to keep the scheduler running:

#### Option A: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start scheduler with PM2
pm2 start npm --name "superj-tests" -- run test:schedule

# View logs
pm2 logs superj-tests

# Stop scheduler
pm2 stop superj-tests

# Restart on system reboot
pm2 startup
pm2 save
```

#### Option B: Screen (Simple)

```bash
# Start in screen session
screen -S superj-tests npm run test:schedule

# Detach (Ctrl+A, then D)

# Reattach later
screen -r superj-tests

# Kill session
screen -X -S superj-tests quit
```

#### Option C: Nohup (Minimal)

```bash
# Run in background, keep running after logout
nohup npm run test:schedule > test-logs/scheduler.out 2>&1 &

# Check if running
ps aux | grep "test:schedule"

# Kill process
kill <PID>
```

### View Test Logs

```bash
# View latest test results
ls -ltr test-logs/

# Follow live logs
tail -f test-logs/test-run-09:00-*.log

# View all notifications
cat test-logs/notifications.log
```

---

## Option 2: Cron Jobs (Linux/Mac - Automatic)

### Setup

```bash
# Edit crontab
crontab -e

# Add these lines:
0 9 * * * cd /Users/rajesh/SuperJ-web && npm run test:api-flow >> test-logs/9am-$(date +\%Y\%m\%d).log 2>&1
0 18 * * * cd /Users/rajesh/SuperJ-web && npm run test:api-flow >> test-logs/6pm-$(date +\%Y\%m\%d).log 2>&1

# Save and exit
```

### Explanation

```
0    9    *    *    *    cd /Users/rajesh/SuperJ-web && npm run test:api-flow
│    │    │    │    │
│    │    │    │    └── Day of week (0-6, 0=Sunday)
│    │    │    └─────── Month (1-12)
│    │    └──────────── Day of month (1-31)
│    └───────────────── Hour (0-23)
└────────────────────── Minute (0-59)
```

### Verify Cron Setup

```bash
# View all cron jobs
crontab -l

# Check if cron is running
ps aux | grep cron

# View system cron log
log stream --predicate 'process == "cron"' --level debug
```

### Troubleshooting Cron

```bash
# Check for mail notification
mail

# View cron errors
cat /var/log/system.log | grep cron

# Run test manually to verify it works
cd /Users/rajesh/SuperJ-web && npm run test:api-flow
```

---

## Option 3: GitHub Actions (Cloud - Auto)

### Setup

Create `.github/workflows/scheduled-tests.yml`:

```yaml
name: Scheduled API Tests

on:
  schedule:
    # 9:00 AM UTC (2:30 PM IST)
    - cron: '0 9 * * *'
    # 6:00 PM UTC (11:30 PM IST)
    - cron: '0 18 * * *'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install

      - name: Run API tests
        run: npm run test:api-flow

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ github.run_id }}
          path: test-results/
          retention-days: 30

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 7

      - name: Notify on failure
        if: failure()
        run: echo "::error::API tests failed at scheduled time"
```

### Advantages

✅ No server needed
✅ Free with GitHub
✅ Automatic test reports
✅ Can be triggered manually too
✅ Integrates with GitHub issues

### Time Conversions

**UTC times in workflow:**
- 9:00 AM UTC = 2:30 PM IST
- 6:00 PM UTC = 11:30 PM IST

**To schedule for IST times, adjust:**
- 9:00 AM IST (03:30 UTC) = `cron: '30 3 * * *'`
- 6:00 PM IST (12:30 UTC) = `cron: '30 12 * * *'`

---

## 📊 Comparing Options

| Feature | Node.js | Cron | GitHub |
|---------|---------|------|--------|
| Setup Time | 5 min | 5 min | 10 min |
| Cost | Free | Free | Free |
| Maintenance | Moderate | Low | Very Low |
| Logs Available | Local | Local | GitHub |
| Notifications | Manual | Manual | Automatic |
| Works Offline | ❌ | ✅ | ✅ |
| Best For | Development | Production | Team |

---

## 📝 Test Execution Details

### What Gets Tested

The scheduler runs: `tests/api-flow-mapping.spec.js`

Which includes:
1. ✅ Launch app & load initial APIs
2. ✅ Login flow (OTP request & verify)
3. ✅ Navigate to wallet
4. ✅ Verify cash balance
5. ✅ Verify gift cards
6. ✅ Generate complete report

### Test Duration

- **Each run:** ~2-3 minutes
- **Total daily:** ~10 minutes for both runs

### What Gets Logged

For each run:
- 📝 Full test output
- 📊 API call summary
- ✅ All responses (status codes, data)
- ❌ Any errors or failures
- ⏱️ Execution timestamp

---

## 🔔 Notifications & Alerts

### Option A: Email (Cron)

```bash
# Add to crontab to send email on failure
0 9 * * * cd /Users/rajesh/SuperJ-web && npm run test:api-flow || echo "Test failed" | mail -s "SuperJ Test Failed" your-email@example.com
```

### Option B: Slack Webhook

Add to `tests/scheduled-daily-tests.js`:

```javascript
async function notifySlack(status, logFile) {
  const webhook = process.env.SLACK_WEBHOOK;
  const message = {
    text: `SuperJ API Test ${status === 'PASSED' ? '✅' : '❌'}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Test Status:* ${status}\n*Time:* ${new Date().toISOString()}`
        }
      }
    ]
  };

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}
```

### Option C: GitHub Actions (Automatic)

GitHub sends notifications for failed workflows automatically.

---

## 🛠️ Troubleshooting

### Tests Not Running (Node.js Scheduler)

**Problem:** Scheduler starts but doesn't execute tests

**Solution:**
```bash
# Check if Node.js can run tests manually
npm run test:api-flow

# If manual works, increase log verbosity
node tests/scheduled-daily-tests.js --verbose
```

### Tests Not Running (Cron)

**Problem:** Cron jobs not executing

**Solution:**
```bash
# 1. Verify crontab is set
crontab -l

# 2. Check cron daemon is running
ps aux | grep cron

# 3. Ensure full paths in cron job
# Use: /usr/local/bin/npm instead of npm

# 4. Check logs
log stream --predicate 'process == "cron"'

# 5. Test manually
cd /full/path/to/SuperJ-web && npm run test:api-flow
```

### GitHub Actions Not Triggering

**Problem:** Workflow not running at scheduled time

**Solution:**
```yaml
# 1. Verify syntax
# https://crontab.guru - verify cron expression

# 2. Check workflow file location
# Must be: .github/workflows/scheduled-tests.yml

# 3. Check branch - cron only runs on default branch
# For `main` or `master`, not feature branches

# 4. View workflow runs
# Go to: GitHub repo → Actions tab
```

---

## 📈 Monitoring & Reports

### View Test History

```bash
# Node.js Scheduler
ls -la test-logs/
cat test-logs/test-run-09:00-*.log

# Cron Jobs
cat test-logs/9am-*.log
cat test-logs/6pm-*.log

# GitHub Actions
# View in: GitHub → Actions → Scheduled API Tests
```

### Parse Logs for Insights

```bash
# Count passed tests
grep "passed" test-logs/*.log | wc -l

# Find failures
grep "failed\|error\|Error" test-logs/*.log

# Get execution times
grep "duration\|time" test-logs/*.log
```

---

## 🔐 Security

### Protect Test Credentials

**For GitHub Actions:**
```yaml
env:
  PHONE_NUMBER: ${{ secrets.TEST_PHONE }}
  OTP_CODES: ${{ secrets.TEST_OTP }}
```

**Set in:** Settings → Secrets and variables

### Log Sanitization

The scheduler automatically masks:
- ✅ Gift card codes (shows `XXXX-XXXX-XXXX-1234`)
- ✅ PINs (shows `****`)
- ✅ JWT tokens (not logged)

---

## 📚 Quick Commands

```bash
# Start Node.js scheduler (development)
npm run test:schedule

# Run single test
npm run test:api-flow

# View latest logs
tail -f test-logs/test-run-*.log

# View all test logs
ls -ltr test-logs/

# Generate report
npm run report

# Setup cron job
crontab -e

# Verify cron is setup
crontab -l
```

---

## ✅ Verification Checklist

- [ ] Tests run successfully when executed manually
- [ ] Scheduler started without errors
- [ ] First scheduled run completed
- [ ] Test logs created in `test-logs/`
- [ ] All 6 test steps completed
- [ ] No API errors in results
- [ ] Second scheduled run at next time slot

---

## 📞 Next Steps

1. **Choose a scheduling method** (Node.js Scheduler recommended for start)
2. **Start the scheduler:** `npm run test:schedule`
3. **Monitor first run** (9:00 AM)
4. **Check logs:** `cat test-logs/test-run-09*.log`
5. **Configure notifications** (Slack/Email)
6. **Monitor second run** (6:00 PM)

---

**Created:** 2026-10-08\
**Version:** 1.0\
**Ready for Production:** ✅ Yes

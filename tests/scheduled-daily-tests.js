/**
 * Scheduled Daily API Tests
 *
 * Runs automated API tests at scheduled times:
 * - 9:00 AM (Morning - check if APIs are healthy after night)
 * - 6:00 PM (Evening - check performance during peak hours)
 *
 * Usage:
 *   node tests/scheduled-daily-tests.js
 *
 * This will run continuously and execute tests at the specified times.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SCHEDULE_TIMES = ['09:00', '18:00']; // 9 AM and 6 PM
const LOG_DIR = path.join(__dirname, '../test-logs');
const REPORT_DIR = path.join(__dirname, '../playwright-report');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Format time for display
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Get next scheduled run time
 */
function getNextRunTime(scheduleTime) {
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  const now = new Date();
  const nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

  // If time has already passed today, schedule for tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}

/**
 * Calculate milliseconds until next run
 */
function getTimeUntilRun(targetTime) {
  const now = new Date();
  return targetTime - now;
}

/**
 * Run the test suite
 */
function runTests(scheduleTime) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOG_DIR, `test-run-${scheduleTime}-${timestamp}.log`);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 STARTING TEST RUN AT ${formatTime(new Date())}`);
  console.log(`📋 Schedule Time: ${scheduleTime}`);
  console.log(`📝 Log File: ${logFile}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    // Run the API flow mapping tests
    const command = 'npx playwright test tests/api-flow-mapping.spec.js --reporter=list';

    console.log(`📌 Running: ${command}\n`);

    // Execute and capture output
    const output = execSync(command, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Log output
    fs.appendFileSync(logFile, `Test run at ${formatTime(new Date())}\n`);
    fs.appendFileSync(logFile, `${'='.repeat(70)}\n`);
    fs.appendFileSync(logFile, output);
    fs.appendFileSync(logFile, `\n${'='.repeat(70)}\n`);

    console.log(`✅ Tests completed successfully!`);
    console.log(`📊 Results logged to: ${logFile}`);

    // Parse output for summary
    const lines = output.split('\n');
    const summaryLine = lines.find(line => line.includes('passed') || line.includes('failed'));
    if (summaryLine) {
      console.log(`📈 Summary: ${summaryLine.trim()}`);
    }

    // Send notification
    notifyCompletion(scheduleTime, true, logFile);

  } catch (error) {
    console.error(`❌ Test execution failed!`);
    console.error(`Error: ${error.message}`);

    // Log error
    fs.appendFileSync(logFile, `\nTest run FAILED at ${formatTime(new Date())}\n`);
    fs.appendFileSync(logFile, `Error: ${error.message}\n`);
    fs.appendFileSync(logFile, error.stack);

    // Send notification
    notifyCompletion(scheduleTime, false, logFile, error.message);
  }

  console.log(`\n${'-'.repeat(70)}`);
  console.log(`⏰ Next scheduled run: ${formatTime(getNextRunTime(scheduleTime))}`);
  console.log(`${'-'.repeat(70)}\n`);
}

/**
 * Send completion notification
 */
function notifyCompletion(scheduleTime, success, logFile, errorMsg = null) {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  const message = `
API Test Run ${status}
Schedule: ${scheduleTime}
Time: ${formatTime(new Date())}
Log: ${logFile}
${errorMsg ? `Error: ${errorMsg}` : ''}
`;

  // Log to file
  const notificationFile = path.join(LOG_DIR, 'notifications.log');
  fs.appendFileSync(notificationFile, message + '\n');

  console.log(`📬 Notification logged`);
}

/**
 * Wait until a specific time
 */
async function waitUntilTime(targetTime) {
  let timeUntilRun = getTimeUntilRun(targetTime);

  while (timeUntilRun > 0) {
    const hours = Math.floor(timeUntilRun / 3600000);
    const minutes = Math.floor((timeUntilRun % 3600000) / 60000);
    const seconds = Math.floor((timeUntilRun % 60000) / 1000);

    process.stdout.write(
      `\r⏳ Waiting... Next run in ${hours}h ${minutes}m ${seconds}s (at ${formatTime(targetTime)})`
    );

    // Check every 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    timeUntilRun = getTimeUntilRun(targetTime);
  }

  console.log('\n'); // New line after waiting
}

/**
 * Main scheduler loop
 */
async function startScheduler() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🕐 AUTOMATED TEST SCHEDULER STARTED`);
  console.log(`📅 Today: ${formatTime(new Date())}`);
  console.log(`⏰ Scheduled times: ${SCHEDULE_TIMES.join(', ')}`);
  console.log(`📁 Log directory: ${LOG_DIR}`);
  console.log(`${'='.repeat(70)}\n`);

  // Show next scheduled runs
  console.log('📋 Upcoming scheduled runs:\n');
  for (const time of SCHEDULE_TIMES) {
    const nextRun = getNextRunTime(time);
    console.log(`   • ${time} → Next run: ${formatTime(nextRun)}`);
  }
  console.log('');

  // Main loop - runs until process is stopped
  while (true) {
    for (const scheduleTime of SCHEDULE_TIMES) {
      const nextRunTime = getNextRunTime(scheduleTime);

      // Wait until it's time to run
      await waitUntilTime(nextRunTime);

      // Run the tests
      runTests(scheduleTime);

      // Small delay before checking next scheduled time
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\n\n🛑 Scheduler stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Scheduler terminated');
  process.exit(0);
});

// Start the scheduler
startScheduler().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/**
 * WhatsApp OTP Reader
 *
 * Automatically reads OTP messages from WhatsApp and extracts the code.
 *
 * Setup (First time only):
 *   1. Run this file
 *   2. QR code will appear
 *   3. Scan with phone camera
 *   4. WhatsApp session saved
 *
 * Usage in tests:
 *   const otp = await getOTPFromWhatsApp(phoneNumber, timeoutMs);
 *   await page.fill(otpInput, otp);
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let client = null;
let isReady = false;
const SESSION_DIR = path.join(__dirname, '../.wapi-session');

// Store OTPs received with timestamp
const receivedOTPs = new Map();

/**
 * Initialize WhatsApp client
 */
async function initializeWhatsApp() {
  if (client && isReady) {
    return client;
  }

  return new Promise((resolve, reject) => {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'superj-test',
        dataPath: SESSION_DIR
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', (qr) => {
      console.log('\n📱 WhatsApp QR Code - Scan with your phone:');
      qrcode.generate(qr, { small: true });
      console.log('\n✅ After scanning, wait for authentication...\n');
    });

    client.on('authenticated', (session) => {
      console.log('✅ WhatsApp authenticated successfully!');
    });

    client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
      reject(new Error('WhatsApp authentication failed'));
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp client ready!');
      isReady = true;
      resolve(client);
    });

    client.on('message', (msg) => {
      // Listen for OTP messages
      handleIncomingMessage(msg);
    });

    client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp disconnected:', reason);
      isReady = false;
    });

    client.initialize().catch(reject);
  });
}

/**
 * Handle incoming messages and extract OTP
 */
function handleIncomingMessage(msg) {
  // Check if message contains OTP pattern
  const otpMatch = msg.body.match(/\b\d{6}\b/); // 6-digit OTP

  if (otpMatch) {
    const otp = otpMatch[0];
    const fromJid = msg.from;

    console.log(`📨 OTP received from ${fromJid}: ${otp}`);

    // Store OTP with timestamp (keep last 5 OTPs)
    const key = `${fromJid}_${Date.now()}`;
    receivedOTPs.set(key, {
      otp,
      timestamp: new Date(),
      from: fromJid,
      message: msg.body
    });

    // Clean up old OTPs (keep only last 5)
    if (receivedOTPs.size > 5) {
      const firstKey = receivedOTPs.keys().next().value;
      receivedOTPs.delete(firstKey);
    }

    console.log(`✅ OTP stored (${receivedOTPs.size} total)`);
  }
}

/**
 * Get OTP from WhatsApp
 *
 * @param {string} phoneNumber - Phone number to wait OTP from (optional)
 * @param {number} timeoutMs - Max time to wait for OTP (default: 60000ms)
 * @returns {Promise<string>} - The OTP code
 */
async function getOTPFromWhatsApp(phoneNumber = null, timeoutMs = 60000) {
  console.log(`\n📱 Waiting for OTP from WhatsApp...`);
  if (phoneNumber) {
    console.log(`   Phone: ${phoneNumber}`);
  }
  console.log(`   Timeout: ${timeoutMs / 1000}s\n`);

  // Initialize if not ready
  if (!isReady) {
    console.log('🔄 Initializing WhatsApp...');
    await initializeWhatsApp();
  }

  const startTime = Date.now();
  const pollInterval = 500; // Check every 500ms

  return new Promise((resolve, reject) => {
    const checkOTP = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed > timeoutMs) {
        reject(new Error(`Timeout waiting for OTP after ${timeoutMs / 1000}s`));
        return;
      }

      // Get most recent OTP
      if (receivedOTPs.size > 0) {
        const lastEntry = Array.from(receivedOTPs.entries()).pop();
        const otp = lastEntry[1].otp;

        console.log(`✅ OTP received: ${otp}`);
        console.log(`   From: ${lastEntry[1].from}`);
        console.log(`   Time: ${lastEntry[1].timestamp.toLocaleTimeString()}\n`);

        // Clear this OTP so it's not reused
        receivedOTPs.delete(lastEntry[0]);

        resolve(otp);
      } else {
        // Still waiting, retry after interval
        const remaining = ((timeoutMs - elapsed) / 1000).toFixed(1);
        process.stdout.write(`\r⏳ Waiting... ${remaining}s remaining`);
        setTimeout(checkOTP, pollInterval);
      }
    };

    checkOTP();
  });
}

/**
 * Disconnect WhatsApp client
 */
async function disconnectWhatsApp() {
  if (client) {
    console.log('\n📴 Disconnecting WhatsApp...');
    await client.destroy();
    isReady = false;
    client = null;
  }
}

/**
 * Get OTP history
 */
function getOTPHistory() {
  const history = [];
  for (const [key, value] of receivedOTPs.entries()) {
    history.push({
      otp: value.otp,
      from: value.from,
      timestamp: value.timestamp,
      message: value.message
    });
  }
  return history;
}

/**
 * Check WhatsApp connection status
 */
function isWhatsAppConnected() {
  return isReady && client !== null;
}

/**
 * Standalone test mode - run directly to test connection
 */
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 WhatsApp OTP Reader - Test Mode\n');
      console.log('Initializing WhatsApp connection...\n');

      await initializeWhatsApp();

      console.log('\n✅ WhatsApp connected!');
      console.log('Waiting for OTP messages...');
      console.log('(Send a test message or request OTP from SuperJ app)\n');

      // Wait for 2 minutes for testing
      await new Promise(resolve => setTimeout(resolve, 120000));

      console.log('\n📋 OTP History:');
      const history = getOTPHistory();
      history.forEach((entry, idx) => {
        console.log(`${idx + 1}. ${entry.otp} - ${entry.timestamp.toLocaleTimeString()}`);
      });

      await disconnectWhatsApp();
      console.log('\n✅ Test completed');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error:', error.message);
      await disconnectWhatsApp();
      process.exit(1);
    }
  })();
}

module.exports = {
  initializeWhatsApp,
  getOTPFromWhatsApp,
  disconnectWhatsApp,
  getOTPHistory,
  isWhatsAppConnected
};

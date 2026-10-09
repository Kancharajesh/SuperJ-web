/**
 * OTP API Reader
 *
 * Reads OTP from the remote API endpoint.
 * No WhatsApp automation needed!
 *
 * API: https://api.insightengine.in/wati/get-latest-otp/{phone}
 * Header: sign: configured with OTP_API_SIGN in the environment
 */

const PHONE_NUMBER = (process.env.OTP_API_PHONE || process.env.PHONE_NUMBER || "").replace(/\D/g, "");
const API_URL = `https://api.insightengine.in/wati/get-latest-otp/${PHONE_NUMBER}`;
const SIGN_HEADER = process.env.OTP_API_SIGN;

function requireAPIConfiguration() {
  if (!PHONE_NUMBER || !SIGN_HEADER) {
    throw new Error("Set OTP_API_PHONE (including country code) and OTP_API_SIGN before using the OTP API");
  }
}

/**
 * Get OTP from API
 * @param {number} timeoutMs - Max time to wait for OTP (default: 60000ms)
 * @returns {Promise<string>} - The OTP code
 */
export async function getOTPFromAPI(timeoutMs = 60000) {
  requireAPIConfiguration();
  console.log(`\n📱 Fetching OTP from API...`);
  console.log(`   Endpoint: ${API_URL}`);
  console.log(`   Timeout: ${timeoutMs / 1000}s\n`);

  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds

  return new Promise((resolve, reject) => {
    const pollOTP = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "sign": SIGN_HEADER,
            "Content-Type": "application/json"
          }
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
          console.error(`\n⚠️  Rate limited (429), waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          const elapsed = Date.now() - startTime;
          if (elapsed > timeoutMs) {
            reject(new Error(`Timeout waiting for OTP after ${timeoutMs / 1000}s`));
            return;
          }
          // Continue polling
          setTimeout(pollOTP, 2000);
          return;
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Check if OTP is in response
        if (data.otp || data.code || data.message) {
          const otp = data.otp || data.code || data.message;

          // Extract 6-digit code if needed
          const match = String(otp).match(/\b\d{6}\b/);
          if (match) {
            const extractedOTP = match[0];
            console.log(`✅ OTP received: ${extractedOTP}`);
            resolve(extractedOTP);
            return;
          }
        }

        // No OTP yet, continue polling
        const elapsed = Date.now() - startTime;
        if (elapsed > timeoutMs) {
          reject(new Error(`Timeout waiting for OTP after ${timeoutMs / 1000}s`));
          return;
        }

        const remaining = ((timeoutMs - elapsed) / 1000).toFixed(1);
        process.stdout.write(`\r⏳ Waiting... ${remaining}s remaining`);

        setTimeout(pollOTP, pollInterval);

      } catch (error) {
        console.error(`\n❌ API Error: ${error.message}`);
        reject(error);
      }
    };

    pollOTP();
  });
}

/**
 * Test the API connection
 */
export async function testAPIConnection() {
  requireAPIConfiguration();
  console.log("\n🔧 Testing OTP API Connection...\n");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "sign": SIGN_HEADER,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log(`✅ API Connection: OK`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data)}\n`);
    return true;
  } catch (error) {
    console.error(`❌ API Connection Failed: ${error.message}\n`);
    return false;
  }
}

// Standalone test mode
if (typeof process !== "undefined" && process.argv[1]?.includes("otp-api-reader")) {
  testAPIConnection()
    .then(success => {
      if (success) {
        console.log("Ready to fetch OTP!");
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

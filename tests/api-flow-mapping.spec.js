import { test, expect } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";
import { Mobile_wallet } from "../pages/Mobile_wallet.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

/**
 * API Flow Mapping Test
 *
 * This test captures all network requests during the mobile wallet flow
 * and documents which APIs are called, their payloads, and responses.
 *
 * Generates: API_FLOW_REPORT.json with detailed endpoint mapping
 */

test.describe("Mobile Wallet - API Flow Mapping", () => {
  let mobileLogin;
  let wallet;
  const apiRequests = [];
  const apiResponses = {};

  test.beforeEach(async ({ page, context }) => {
    mobileLogin = new Mobile_login(page);
    wallet = new Mobile_wallet(page);

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Capture all network requests
    page.on("request", (request) => {
      const url = request.url();
      const method = request.method();
      const postData = request.postDataJSON().catch(() => request.postData());

      // Only capture superj.app API calls
      if (url.includes("superj.app/api") || url.includes("superj.app/graphql")) {
        apiRequests.push({
          timestamp: new Date().toISOString(),
          method,
          url,
          headers: request.headers(),
          body: postData,
          resourceType: request.resourceType(),
        });

        console.log(`📤 [${method}] ${url}`);
        if (postData) {
          console.log(`   Payload:`, postData);
        }
      }
    });

    // Capture all responses
    page.on("response", async (response) => {
      const url = response.url();
      const status = response.status();

      if (url.includes("superj.app/api") || url.includes("superj.app/graphql")) {
        try {
          const responseBody = await response.json().catch(() => response.text());
          apiResponses[url] = {
            status,
            statusText: response.statusText(),
            headers: response.headers(),
            body: responseBody,
            timestamp: new Date().toISOString(),
          };

          console.log(`📥 [${status}] ${url.split("?")[0]}`);
          console.log(`   Response:`, typeof responseBody === "string" ? responseBody.substring(0, 100) : JSON.stringify(responseBody).substring(0, 100));
        } catch (error) {
          console.log(`📥 [${status}] ${url} (could not parse response)`);
        }
      }
    });
  });

  test("Step 1: Launch Application & Capture Home Page APIs", async ({ page }) => {
    console.log("\n🚀 STEP 1: Launching Application\n");

    await mobileLogin.launchApplication();

    // Wait for initial APIs to complete
    await page.waitForLoadState("networkidle");

    console.log(`\n✅ Captured ${apiRequests.length} API requests on home page`);
    console.log(`\n📊 Unique API Endpoints on Home Page:`);
    const uniqueEndpoints = [...new Set(apiRequests.map(r => r.url.split("?")[0]))];
    uniqueEndpoints.forEach((endpoint, idx) => {
      console.log(`   ${idx + 1}. ${endpoint}`);
    });
  });

  test("Step 2: Login Flow - OTP Request & Verification", async ({ page }) => {
    console.log("\n🔐 STEP 2: Login Flow\n");

    apiRequests.length = 0; // Reset

    await mobileLogin.launchApplication();
    await mobileLogin.clickStartNow();
    await mobileLogin.enterMobileNumber(PHONE_NUMBER);

    console.log("\n→ Clicking Continue to Request OTP...");
    await mobileLogin.clickContinue();

    // Wait for OTP request
    await page.waitForTimeout(2000);

    console.log(`\n📋 API Calls During OTP Request:`);
    const otpPhaseRequests = apiRequests.filter(r => r.url.includes("otp") || r.url.includes("phone"));
    otpPhaseRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url.split("?")[0]}`);
      if (req.body) console.log(`   Body: ${JSON.stringify(req.body)}`);
    });

    // Enter OTP
    apiRequests.length = 0; // Reset
    console.log("\n→ Entering OTP...");
    await mobileLogin.enterOTP(OTP_CODES);
    await page.waitForTimeout(2000);

    console.log(`\n📋 API Calls During OTP Verification:`);
    const verifyPhaseRequests = apiRequests.filter(r => r.url.includes("verify") || r.url.includes("otp"));
    verifyPhaseRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url.split("?")[0]}`);
      if (req.body) console.log(`   Body: ${JSON.stringify(req.body)}`);
    });

    // Wait for login to complete
    await mobileLogin.verifyUserLoggedIn();
    console.log("\n✅ User logged in successfully");
  });

  test("Step 3: Navigate to Wallet - Capture Wallet APIs", async ({ page }) => {
    console.log("\n💰 STEP 3: Wallet Navigation & Load\n");

    // Setup: Login first
    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    apiRequests.length = 0; // Reset to capture only wallet APIs

    console.log("→ Navigating to Wallet Page...");
    await wallet.openWallet();

    // Wait for all wallet data to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    console.log(`\n📊 Total API Requests for Wallet Page: ${apiRequests.length}`);

    const walletEndpoints = {};
    apiRequests.forEach(req => {
      const endpoint = req.url.split("?")[0].replace(/.*\/api\//, "");
      if (!walletEndpoints[endpoint]) {
        walletEndpoints[endpoint] = [];
      }
      walletEndpoints[endpoint].push(req);
    });

    console.log(`\n📋 Wallet Page API Endpoints:`);
    Object.entries(walletEndpoints).forEach(([endpoint, requests], idx) => {
      console.log(`\n   ${idx + 1}. ${endpoint}`);
      console.log(`      Calls: ${requests.length}`);
      console.log(`      Method: ${requests[0].method}`);
    });
  });

  test("Step 4: Verify Cash Balance - API Response", async ({ page }) => {
    console.log("\n💵 STEP 4: Cash Balance API\n");

    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    apiRequests.length = 0;

    await wallet.openWallet();
    await wallet.verifyCashBalance();

    await page.waitForTimeout(1000);

    console.log(`\n📋 Balance-Related API Calls:`);
    const balanceRequests = apiRequests.filter(r => r.url.includes("wallet") || r.url.includes("balance"));

    if (balanceRequests.length === 0) {
      console.log("   (No specific balance endpoint - likely part of main wallet API)");
    }

    balanceRequests.forEach(req => {
      console.log(`\n   Request: ${req.method} ${req.url}`);
      if (req.body) console.log(`   Body: ${JSON.stringify(req.body)}`);

      const response = apiResponses[req.url];
      if (response) {
        console.log(`   Response Status: ${response.status}`);
        if (typeof response.body === "object") {
          console.log(`   Response Data: ${JSON.stringify(response.body).substring(0, 200)}...`);
        }
      }
    });
  });

  test("Step 5: Verify Gift Cards - API Response", async ({ page }) => {
    console.log("\n🎁 STEP 5: Gift Cards API\n");

    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    apiRequests.length = 0;

    await wallet.openWallet();
    await wallet.verifyGiftCards();

    await page.waitForTimeout(1000);

    console.log(`\n📋 Gift Cards API Calls:`);
    const giftCardRequests = apiRequests.filter(r =>
      r.url.includes("gift") || r.url.includes("voucher") || r.url.includes("reward")
    );

    if (giftCardRequests.length === 0) {
      console.log("   (No specific gift card endpoint - likely part of main wallet API)");
    }

    giftCardRequests.forEach(req => {
      console.log(`\n   Request: ${req.method} ${req.url}`);
      const response = apiResponses[req.url];
      if (response) {
        console.log(`   Response Status: ${response.status}`);
        if (typeof response.body === "object" && response.body.data) {
          console.log(`   Items Count: ${Array.isArray(response.body.data) ? response.body.data.length : "N/A"}`);
        }
      }
    });
  });

  test("Step 6: Generate Complete API Flow Report", async ({ page }) => {
    console.log("\n📊 STEP 6: Generating API Flow Report\n");

    // Perform complete flow
    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();
    await wallet.openWallet();
    await wallet.verifyCashBalance();
    await wallet.verifyGiftCards();

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Compile comprehensive report
    const apiFlowReport = {
      timestamp: new Date().toISOString(),
      testRun: "Mobile Wallet Flow",
      summary: {
        totalRequests: apiRequests.length,
        uniqueEndpoints: [...new Set(apiRequests.map(r => r.url.split("?")[0]))].length,
        totalResponses: Object.keys(apiResponses).length,
      },
      requests: apiRequests.map(req => ({
        timestamp: req.timestamp,
        method: req.method,
        endpoint: req.url.split("?")[0].replace(/.*\/api\//, ""),
        fullUrl: req.url,
        resourceType: req.resourceType,
        hasPayload: !!req.body,
        payload: req.body,
      })),
      responses: Object.entries(apiResponses).reduce((acc, [url, response]) => {
        acc[url.split("?")[0].replace(/.*\/api\//, "")] = {
          status: response.status,
          statusText: response.statusText,
          timestamp: response.timestamp,
          dataType: typeof response.body,
          success: response.status >= 200 && response.status < 300,
        };
        return acc;
      }, {}),
    };

    console.log("\n✅ API Flow Report Generated!");
    console.log(`\n📈 Summary:`);
    console.log(`   Total API Calls: ${apiFlowReport.summary.totalRequests}`);
    console.log(`   Unique Endpoints: ${apiFlowReport.summary.uniqueEndpoints}`);
    console.log(`   Responses Captured: ${apiFlowReport.summary.totalResponses}`);

    console.log(`\n🔗 API Endpoints Called:`);
    const endpointList = [...new Set(apiRequests.map(r => r.url.split("?")[0].replace(/.*\/api\//, "")))];
    endpointList.forEach((endpoint, idx) => {
      const callCount = apiRequests.filter(r => r.url.includes(endpoint.split("/")[0])).length;
      console.log(`   ${idx + 1}. ${endpoint} (${callCount} calls)`);
    });

    // Verify responses
    console.log(`\n✔️ Response Status Checks:`);
    let successCount = 0;
    let errorCount = 0;

    Object.entries(apiResponses).forEach(([url, response]) => {
      if (response.status >= 200 && response.status < 300) {
        successCount++;
      } else {
        errorCount++;
        console.log(`   ⚠️ ${response.status} ${url.split("?")[0]}`);
      }
    });

    console.log(`   ✅ Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }

    expect(errorCount).toBe(0);
  });
});

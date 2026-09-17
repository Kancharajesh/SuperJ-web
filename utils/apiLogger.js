const fs = require("fs");
const path = require("path");

// Fields that occasionally show up in cleartext query strings/bodies on
// third-party analytics calls (mixpanel, fingerprintjs) — never SuperJ's own
// API, which encrypts its entire payload (see README notes in api.spec.js).
const SENSITIVE_KEYS = /token|otp|password|authorization|cookie/i;

function redact(value) {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_KEYS.test(key)) url.searchParams.set(key, "[REDACTED]");
    }
    return url.toString();
  } catch {
    return value;
  }
}

/**
 * Attaches a response listener to `page` and records every XHR/fetch call
 * (i.e. real API traffic, not documents/images/scripts/styles) into the
 * returned array. Call this once per page before navigating.
 */
function attachApiLogger(page) {
  const calls = [];

  page.on("response", async (response) => {
    const request = response.request();
    const resourceType = request.resourceType();
    if (resourceType !== "xhr" && resourceType !== "fetch") return;

    let responseBody;
    try {
      const contentType = response.headers()["content-type"] || "";
      if (contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = (await response.text()).slice(0, 1000);
      }
    } catch (err) {
      responseBody = `<unreadable: ${err.message}>`;
    }

    calls.push({
      timestamp: new Date().toISOString(),
      method: request.method(),
      url: redact(request.url()),
      status: response.status(),
      requestBody: request.postData(),
      responseBody,
    });
  });

  return calls;
}

/**
 * Groups captured calls by METHOD + path (query string dropped) so repeated
 * polling/tracking calls collapse into one row with a hit count and one
 * sample response.
 */
function summarizeApiCalls(calls) {
  const byEndpoint = new Map();

  for (const call of calls) {
    let key;
    try {
      const u = new URL(call.url);
      key = `${call.method} ${u.origin}${u.pathname}`;
    } catch {
      key = `${call.method} ${call.url}`;
    }

    if (!byEndpoint.has(key)) {
      byEndpoint.set(key, {
        endpoint: key,
        hits: 0,
        statuses: new Set(),
        sample: call,
      });
    }
    const entry = byEndpoint.get(key);
    entry.hits += 1;
    entry.statuses.add(call.status);
  }

  return [...byEndpoint.values()].map((e) => ({
    endpoint: e.endpoint,
    hits: e.hits,
    statuses: [...e.statuses],
    sampleRequestBody: e.sample.requestBody,
    sampleResponseBody: e.sample.responseBody,
  }));
}

function writeApiReport(calls, outFile) {
  const summary = summarizeApiCalls(calls);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    JSON.stringify({ totalCalls: calls.length, endpoints: summary, calls }, null, 2)
  );
  return summary;
}

module.exports = { attachApiLogger, summarizeApiCalls, writeApiReport };

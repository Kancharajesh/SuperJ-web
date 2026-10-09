import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

test("snapshot targets stay stable and external clicks/redirects are blocked", async () => {
  const server = http.createServer((req, res) => {
    if (req.url === "/redirect") { res.writeHead(302, { Location: "https://example.invalid/" }); res.end(); return; }
    res.setHeader("Content-Type", "text/html");
    res.end(`<title>Robot fixture</title>
      <button onclick="this.before(document.createElement('button'))">Insert a button</button>
      <input aria-label="Name"><a href="https://example.invalid/">External</a>`);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.BASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.BROWSER_HEADLESS = "true";
  const { executeBrowserTool: tool, closeBrowser } = await import("../browser-tools.js");
  try {
    await tool("browser_navigate", { url: "/" });
    const snapshot = await tool("browser_snapshot", {});
    assert.match(snapshot, /\[1\] <input> Name/);
    await tool("browser_click", { index: 0 });
    // A positional locator would now target the button, not the original input.
    assert.equal(await tool("browser_fill", { index: 1, text: "Synthetic Name" }), "Filled element 1");
    await tool("browser_click", { index: 2 }).catch(() => {});
    await assert.rejects(tool("browser_snapshot", {}), /left the allowed origin/);
    await closeBrowser();
    await assert.rejects(tool("browser_navigate", { url: "/redirect" }), /ERR_BLOCKED_BY_CLIENT/);
  } finally {
    await closeBrowser();
    await new Promise((resolve) => server.close(resolve));
  }
});

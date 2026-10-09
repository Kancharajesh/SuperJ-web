import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { connectMcpServers, expandEnv, mcpToolName, resultToText, toParameters } from "../mcp.js";

const fixture = fileURLToPath(new URL("fixtures/echo-mcp-server.js", import.meta.url));
const quiet = () => {};

test("stdio server tools are exposed, callable and isolated from agent secrets", async () => {
  const mcp = await connectMcpServers(
    { echo: { command: process.execPath, args: [fixture], env: { PASSED: "${TOKEN}" } } },
    { env: { TOKEN: "t0k", SECRET_KEY: "nope" }, log: quiet },
  );
  try {
    assert.deepEqual(mcp.tools.map((t) => t.name), ["mcp__echo__echo", "mcp__echo__fail", "mcp__echo__env_leak"]);
    const echo = mcp.tools[0];
    assert.equal(echo.parameters.type, "object");
    assert.equal(echo.parameters.$schema, undefined);
    assert.deepEqual(echo.parameters.required, ["text"]);
    assert.equal(await mcp.call("mcp__echo__echo", { text: "hi" }), "echo: hi");
    await assert.rejects(mcp.call("mcp__echo__fail", {}), /boom/);
    assert.deepEqual(JSON.parse(await mcp.call("mcp__echo__env_leak", {})), { secret: null, passed: "t0k" });
    assert.equal(mcp.has("read_file"), false);
  } finally {
    await mcp.close();
  }
});

test("allowedTools filters, disabled and broken servers are skipped", async () => {
  const logs = [];
  const mcp = await connectMcpServers({
    echo: { command: process.execPath, args: [fixture], allowedTools: ["echo"] },
    off: { command: "does-not-matter", disabled: true },
    broken: { command: "/nonexistent/mcp-server" },
    nothing: {},
  }, { log: (line) => logs.push(line) });
  try {
    assert.deepEqual(mcp.tools.map((t) => t.name), ["mcp__echo__echo"]);
    assert.ok(logs.some((l) => /skipping broken/.test(l)));
    assert.ok(logs.some((l) => /skipping nothing: .*command.*url/.test(l)));
    assert.ok(!logs.some((l) => /off/.test(l)));
  } finally {
    await mcp.close();
  }
});

test("helpers: names, env expansion, schemas, results", () => {
  assert.equal(mcpToolName("my.server", "a/b"), "mcp__my_server__a_b");
  assert.equal(mcpToolName("s", "x".repeat(100)).length, 64);
  assert.equal(expandEnv("Bearer ${T}", { T: "abc" }), "Bearer abc");
  assert.throws(() => expandEnv("${MISSING}", {}), /MISSING/);
  assert.deepEqual(toParameters(undefined), { type: "object", properties: {} });
  assert.equal(resultToText({ content: [{ type: "text", text: "a" }, { type: "image", data: "x" }] }), "a\n[image content omitted]");
  assert.equal(resultToText({ content: [], structuredContent: { n: 1 } }), '{"n":1}');
});

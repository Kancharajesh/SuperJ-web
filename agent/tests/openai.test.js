import test from "node:test";
import assert from "node:assert/strict";
import { createOpenAISession } from "../providers/openai.js";

const tools = [{ name: "browser_snapshot", description: "Inspect", parameters: { type: "object", properties: {} } }];
const call = (args = "{}", name = "browser_snapshot") => ({ type: "function_call", name, arguments: args, call_id: "call-1" });
const message = { type: "message", role: "assistant", content: [{ type: "output_text", text: "Done" }] };
function fixture(outputs) {
  const requests = [];
  const session = createOpenAISession({ apiKey: "synthetic-test-key", systemInstruction: "Test the page", tools,
    fetchImpl: async (url, options) => {
      requests.push(JSON.parse(options.body));
      const output = outputs.shift();
      assert.ok(output, "Unexpected API request");
      return { ok: true, json: async () => ({ status: "completed", output }) };
    },
  });
  return { session, requests };
}

test("returns tool results, preserves reasoning and continues conversation", async () => {
  const reasoning = { type: "reasoning", id: "r1", encrypted_content: "opaque", summary: [] };
  const { session, requests } = fixture([[reasoning, call()], [message], [message]]);
  let executed = 0;
  const options = { maxRounds: 1, executeTool: async () => { executed++; return "Home is visible"; } };
  assert.equal(await session.send("Test Home", options), "Done");
  assert.equal(executed, 1);
  assert.equal(requests[1].input.at(-1).output, "Home is visible");
  assert.deepEqual(requests[1].input[1], reasoning);
  assert.equal(requests[1].instructions, "Test the page");
  assert.equal(requests[0].parallel_tool_calls, false);
  assert.equal(requests[0].store, false);
  await session.send("Continue", options);
  assert.equal(requests[2].input.at(-1).content, "Continue");
  assert.ok(requests[2].input.some((item) => item.type === "function_call_output"));
});

test("malformed arguments and unknown tools return errors without execution", async () => {
  for (const item of [call("{"), call("{}", "run_shell")]) {
    const { session, requests } = fixture([[item], [message]]);
    await session.send("Test", { executeTool: async () => assert.fail("must not execute") });
    assert.match(requests[1].input.at(-1).output, /^Error:/);
  }
});

test("tool failures are returned to the model", async () => {
  const { session, requests } = fixture([[call()], [message]]);
  await session.send("Test", { executeTool: async () => { throw new Error("Element detached"); } });
  assert.equal(requests[1].input.at(-1).output, "Error: Element detached");
});

test("round cap prevents extra actions and failed history is not reused", async () => {
  const { session, requests } = fixture([[call()], [call()], [message]]);
  let executions = 0;
  await assert.rejects(session.send("Test", { maxRounds: 1, executeTool: async () => ++executions }), /Stopped after 1/);
  assert.equal(executions, 1);
  await session.send("Fresh turn", { executeTool: async () => {} });
  assert.equal(requests[2].input.length, 1);
});

test("missing credentials, HTTP errors and incomplete responses fail clearly", async () => {
  assert.throws(() => createOpenAISession({ tools }), /Missing OPENAI_API_KEY/);
  for (const [response, expected] of [
    [{ ok: false, status: 401, text: async () => "Unauthorized" }, /HTTP 401/],
    [{ ok: true, json: async () => ({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" } }) }, /incomplete/],
  ]) {
    const session = createOpenAISession({ apiKey: "synthetic-key", tools, fetchImpl: async () => response });
    await assert.rejects(session.send("Test", {}), expected);
  }
});

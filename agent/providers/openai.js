// Native fetch keeps this adapter dependency-free (Node.js 20+).
export function createOpenAISession({ apiKey, model = "gpt-5.4-mini", systemInstruction, tools, fetchImpl = fetch }) {
  if (!apiKey || /^(your-|placeholder)/i.test(apiKey)) {
    throw new Error("Missing OPENAI_API_KEY. Add it to agent/.env.");
  }
  const definitions = tools.map(({ name, description, parameters }) => ({
    type: "function", name, description, parameters, strict: false,
  }));
  const allowedNames = new Set(tools.map(({ name }) => name));
  let history = [];

  return {
    async send(userInput, { onToolCall = () => {}, executeTool, maxRounds = 40 }) {
      const input = [...history, { role: "user", content: userInput }];
      for (let round = 0; ; round++) {
        const http = await fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(120000),
          body: JSON.stringify({
            model, instructions: systemInstruction, input, tools: definitions,
            parallel_tool_calls: false, store: false,
            include: ["reasoning.encrypted_content"], max_output_tokens: 4096,
          }),
        });
        if (!http.ok) {
          throw new Error(`OpenAI HTTP ${http.status}: ${(await http.text()).slice(0, 1000)}`);
        }
        const response = await http.json();
        if (response.status !== "completed") {
          throw new Error(`OpenAI response ${response.status}: ${JSON.stringify(response.error || response.incomplete_details)}`);
        }
        input.push(...response.output);
        const calls = response.output.filter((item) => item.type === "function_call");
        if (!calls.length) {
          const text = response.output.filter((item) => item.type === "message")
            .flatMap((item) => item.content)
            .filter((item) => item.type === "output_text")
            .map((item) => item.text).join("\n");
          if (!text) throw new Error("OpenAI returned no final text (possibly a refusal).");
          history = input;
          return text;
        }
        if (round >= maxRounds) throw new Error(`Stopped after ${maxRounds} tool-call rounds without a final answer`);
        for (const call of calls) {
          let result;
          try {
            if (!allowedNames.has(call.name)) throw new Error(`Unknown tool: ${call.name}`);
            const args = JSON.parse(call.arguments);
            onToolCall(call.name, args);
            result = await executeTool(call.name, args);
          } catch (err) {
            result = `Error: ${err.message}`;
          }
          input.push({ type: "function_call_output", call_id: call.call_id, output: String(result) });
        }
      }
    },
  };
}

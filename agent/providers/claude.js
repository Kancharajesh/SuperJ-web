import Anthropic from "@anthropic-ai/sdk";

// Our tool defs are shaped for Gemini's function-calling format
// ({name, description, parameters}); Claude's Messages API wants
// {name, description, input_schema} instead.
function toAnthropicTools(tools) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

// Unlike Gemini's interaction-id continuity, Claude has no server-side
// session — the full message history is replayed on every call, so this
// session keeps that array in closure.
export function createClaudeSession({ apiKey, model, systemInstruction, tools }) {
  const client = new Anthropic({ apiKey });
  const anthropicTools = toAnthropicTools(tools);
  const messages = [];

  return {
    async send(userInput, { onToolCall, executeTool, maxRounds }) {
      messages.push({ role: "user", content: userInput });

      for (let round = 0; round <= maxRounds; round++) {
        if (round === maxRounds) {
          throw new Error(`Stopped after ${maxRounds} tool-call rounds without a final answer`);
        }

        const response = await client.messages.create({
          model,
          max_tokens: 4096,
          system: systemInstruction,
          messages,
          tools: anthropicTools,
        });
        messages.push({ role: "assistant", content: response.content });

        if (response.stop_reason !== "tool_use") {
          const textBlock = response.content.find((c) => c.type === "text");
          return textBlock ? textBlock.text : "";
        }

        const toolResults = [];
        for (const block of response.content) {
          if (block.type !== "tool_use") continue;
          onToolCall(block.name, block.input);

          let result;
          try {
            result = await executeTool(block.name, block.input);
          } catch (err) {
            result = `Error: ${err.message}`;
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: String(result),
          });
        }
        messages.push({ role: "user", content: toolResults });
      }
    },
  };
}

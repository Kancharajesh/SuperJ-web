import { GoogleGenAI } from "@google/genai";

// The free tier caps at 5 requests/minute and resets fast (the API's own
// error names the wait, e.g. "Please retry in 1.8s") — so a short backoff
// clears it instead of failing a whole run over a transient 429.
const MAX_RATE_LIMIT_RETRIES = 8;

function parseRetryDelayMs(message) {
  const match = /retry in ([\d.]+)\s*s/i.exec(message || "");
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 15000;
}

async function createInteraction(client, params) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await client.interactions.create(params);
    } catch (err) {
      const isRateLimit = err?.status === 429 || /429|RESOURCE_EXHAUSTED|quota/i.test(err?.message || "");
      if (!isRateLimit || attempt >= MAX_RATE_LIMIT_RETRIES) throw err;
      await new Promise((resolve) => setTimeout(resolve, parseRetryDelayMs(err.message)));
    }
  }
}

// Gemini's Interactions API is stateful server-side (previous_interaction_id
// chains turns together), unlike Claude/OpenAI which require replaying the
// full message history — so this session only needs to remember one id.
export function createGeminiSession({ apiKey, model, systemInstruction, tools }) {
  const client = new GoogleGenAI({ apiKey });
  let previousInteractionId;

  return {
    async send(userInput, { onToolCall, executeTool, maxRounds }) {
      let interaction = await createInteraction(client, {
        model,
        system_instruction: systemInstruction,
        input: userInput,
        previous_interaction_id: previousInteractionId,
        tools,
      });

      let rounds = 0;
      while (interaction.steps.some((s) => s.type === "function_call")) {
        if (++rounds > maxRounds) {
          throw new Error(`Stopped after ${maxRounds} tool-call rounds without a final answer`);
        }
        const functionResults = [];

        for (const step of interaction.steps) {
          if (step.type !== "function_call") continue;
          onToolCall(step.name, step.arguments);

          let result;
          try {
            result = await executeTool(step.name, step.arguments);
          } catch (err) {
            result = `Error: ${err.message}`;
          }

          functionResults.push({
            type: "function_result",
            name: step.name,
            call_id: step.id,
            result: [{ type: "text", text: String(result) }],
          });
        }

        interaction = await createInteraction(client, {
          model,
          previous_interaction_id: interaction.id,
          tools,
          input: functionResults,
        });
      }

      previousInteractionId = interaction.id;
      return interaction.output_text;
    },
  };
}

import "dotenv/config";
import readline from "node:readline/promises";
import { GoogleGenAI } from "@google/genai";
import { TOOLS, executeTool } from "./tools.js";
import { BROWSER_TOOLS, executeBrowserTool, closeBrowser } from "./browser-tools.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const WORKDIR = process.cwd();
const ALL_TOOLS = [...TOOLS, ...BROWSER_TOOLS];
const BROWSER_TOOL_NAMES = new Set(BROWSER_TOOLS.map((t) => t.name));
const MAX_TOOL_ROUNDS = 40; // safety cap for headless/--once runs with no one watching to interrupt a stuck loop

async function executeAnyTool(name, args) {
  return BROWSER_TOOL_NAMES.has(name) ? executeBrowserTool(name, args) : executeTool(name, args);
}

const SYSTEM_INSTRUCTION = `You are a local coding/automation agent running on the user's machine.
You have read_file, write_file, list_dir and run_shell tools, all restricted to the
current working directory (${WORKDIR}), plus browser_navigate, browser_snapshot, browser_click,
browser_fill and browser_go_back tools for driving a real browser against the app (origin-locked,
see browser_navigate's description for the allowed origin). Be concise. Before running a
destructive or irreversible shell command (deleting files, git push --force, etc.), say so
explicitly and ask the user to confirm in plain text before you call the tool.`;

async function runTurn(client, userInput, previousInteractionId) {
  let interaction = await client.interactions.create({
    model: MODEL,
    system_instruction: SYSTEM_INSTRUCTION,
    input: userInput,
    previous_interaction_id: previousInteractionId,
    tools: ALL_TOOLS,
  });

  // Keep resolving tool calls until the model finally answers in plain text,
  // capped so a stuck loop can't run unattended forever (headless/--once runs).
  let rounds = 0;
  while (interaction.steps.some((s) => s.type === "function_call")) {
    if (++rounds > MAX_TOOL_ROUNDS) {
      throw new Error(`Stopped after ${MAX_TOOL_ROUNDS} tool-call rounds without a final answer`);
    }
    const functionResults = [];

    for (const step of interaction.steps) {
      if (step.type !== "function_call") continue;

      console.log(`  -> ${step.name}(${JSON.stringify(step.arguments)})`);

      let result;
      try {
        result = await executeAnyTool(step.name, step.arguments);
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

    interaction = await client.interactions.create({
      model: MODEL,
      previous_interaction_id: interaction.id,
      tools: ALL_TOOLS,
      input: functionResults,
    });
  }

  return interaction;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "Missing GEMINI_API_KEY.\n" +
        "1. Get a free key at https://aistudio.google.com/apikey\n" +
        "2. Copy .env.example to .env and paste it in.\n"
    );
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  // Non-interactive mode for cron/launchd: `node index.js --once "<prompt>"`
  // runs a single turn and exits, since there's no terminal to type into.
  const onceIndex = process.argv.indexOf("--once");
  if (onceIndex !== -1) {
    const prompt = process.argv[onceIndex + 1];
    if (!prompt) {
      console.error("--once requires a prompt argument");
      process.exit(1);
    }
    try {
      const interaction = await runTurn(client, prompt, undefined);
      console.log(interaction.output_text);
    } catch (err) {
      console.error("Error:", err.message);
      process.exitCode = 1;
    } finally {
      await closeBrowser();
    }
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`Free coding agent ready (model: ${MODEL})`);
  console.log(`Working directory: ${WORKDIR}`);
  console.log("Type a request, or 'exit' to quit.\n");

  let previousInteractionId;
  while (true) {
    const userInput = await rl.question("> ");
    const trimmed = userInput.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase() === "exit") break;

    try {
      const interaction = await runTurn(client, userInput, previousInteractionId);
      previousInteractionId = interaction.id;
      console.log(`\n${interaction.output_text}\n`);
    } catch (err) {
      console.error("Error:", err.message, "\n");
    }
  }

  rl.close();
  await closeBrowser();
}

main();

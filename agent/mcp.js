import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, getDefaultEnvironment } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Bridges MCP servers into the agent's own tool format ({name, description,
// parameters}), so every provider in providers/ can call them without
// knowing MCP exists. Config uses the same shape as Claude Code/Claude
// Desktop's "mcpServers" block, so entries can be copied between them.

// Gemini and OpenAI both reject function names outside [A-Za-z0-9_-]{1,64}.
export function mcpToolName(server, tool) {
  return `mcp__${server}__${tool}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64);
}

// "${VAR}" placeholders let secrets stay in .env instead of mcp.json.
export function expandEnv(value, env = process.env) {
  return value.replace(/\$\{(\w+)\}/g, (_, name) => {
    if (env[name] === undefined) throw new Error(`MCP config references unset env var ${name}`);
    return env[name];
  });
}

const expandAll = (record = {}, env) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, expandEnv(String(value), env)]));

// Tool schemas come from arbitrary servers; strip the parts providers choke on.
export function toParameters(inputSchema) {
  const { $schema, ...schema } = inputSchema || {};
  return { ...schema, type: "object", properties: schema.properties || {} };
}

// Tool results are content arrays; the providers only pass strings back.
export function resultToText(result) {
  if (result.toolResult !== undefined) return JSON.stringify(result.toolResult); // legacy protocol shape
  const parts = (result.content || []).map((item) => {
    if (item.type === "text") return item.text;
    if (item.type === "resource") return item.resource?.text ?? `[resource ${item.resource?.uri}]`;
    if (item.type === "resource_link") return `[resource ${item.uri}]`;
    return `[${item.type} content omitted]`;
  });
  if (!parts.length && result.structuredContent) parts.push(JSON.stringify(result.structuredContent));
  const text = parts.join("\n");
  if (result.isError) throw new Error(text || "MCP tool reported an error");
  return text;
}

function createTransport(name, config, { env, cwd }) {
  if (config.url) {
    return new StreamableHTTPClientTransport(new URL(expandEnv(config.url, env)), {
      requestInit: { headers: expandAll(config.headers, env) },
    });
  }
  if (!config.command) throw new Error(`MCP server "${name}" needs either "command" or "url"`);
  return new StdioClientTransport({
    command: config.command,
    args: (config.args || []).map((arg) => expandEnv(arg, env)),
    // Only a minimal env (PATH, HOME, ...) plus what the config names —
    // servers don't inherit the agent's API keys by default.
    env: { ...getDefaultEnvironment(), ...expandAll(config.env, env) },
    cwd: config.cwd ? path.resolve(cwd, config.cwd) : cwd,
    stderr: "ignore",
  });
}

export async function readMcpConfig(configPath) {
  let raw;
  try {
    raw = await fs.readFile(configPath, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
  return JSON.parse(raw).mcpServers || {};
}

// One failing server is skipped with a warning rather than taking the whole
// agent down — scheduled --once runs have nobody watching to fix it.
export async function connectMcpServers(servers, { env = process.env, cwd = process.cwd(), log = console.warn } = {}) {
  const clients = [];
  const tools = [];
  const handlers = new Map();

  for (const [name, config] of Object.entries(servers)) {
    if (config.disabled) continue;
    const client = new Client({ name: "superj-agent", version: "1.0.0" });
    try {
      await client.connect(createTransport(name, config, { env, cwd }));
      const listed = [];
      let cursor;
      do {
        const page = await client.listTools(cursor ? { cursor } : undefined);
        listed.push(...page.tools);
        cursor = page.nextCursor;
      } while (cursor);

      const allow = config.allowedTools && new Set(config.allowedTools);
      const selected = listed.filter((tool) => !allow || allow.has(tool.name));
      const names = selected.map((tool) => mcpToolName(name, tool.name));
      const clash = names.find((toolName, i) => handlers.has(toolName) || names.indexOf(toolName) !== i);
      if (clash) throw new Error(`Duplicate MCP tool name ${clash}`);

      selected.forEach((tool, i) => {
        tools.push({
          type: "function",
          name: names[i],
          description: `[MCP ${name}] ${tool.description || tool.name}`,
          parameters: toParameters(tool.inputSchema),
        });
        handlers.set(names[i], async (args) => resultToText(await client.callTool({ name: tool.name, arguments: args || {} })));
      });
      clients.push(client);
      log(`MCP: ${name} connected (${selected.length} tools)`);
    } catch (err) {
      log(`MCP: skipping ${name}: ${err.message}`);
      await client.close().catch(() => {});
    }
  }

  return {
    tools,
    has: (toolName) => handlers.has(toolName),
    call: (toolName, args) => handlers.get(toolName)(args),
    close: () => Promise.all(clients.map((client) => client.close().catch(() => {}))),
  };
}

export async function loadMcpTools(configPath, options) {
  return connectMcpServers(await readMcpConfig(configPath), options);
}

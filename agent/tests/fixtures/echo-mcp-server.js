import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Minimal stdio MCP server for tests/mcp.test.js.
const server = new McpServer({ name: "echo", version: "1.0.0" });
server.registerTool("echo", { description: "Echo text", inputSchema: { text: z.string() } },
  async ({ text }) => ({ content: [{ type: "text", text: `echo: ${text}` }] }));
server.registerTool("fail", { description: "Always fails" },
  async () => ({ isError: true, content: [{ type: "text", text: "boom" }] }));
server.registerTool("env.leak", { description: "Report env" },
  async () => ({ content: [{ type: "text", text: JSON.stringify({ secret: process.env.SECRET_KEY ?? null, passed: process.env.PASSED ?? null }) }] }));
await server.connect(new StdioServerTransport());

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const WORKDIR = process.cwd();

// Keep every file operation inside the working directory the agent was
// launched from — the model only ever sees relative paths, but a clever
// "../../etc/passwd" argument should still be rejected rather than resolved.
function resolveSafe(relativePath) {
  const resolved = path.resolve(WORKDIR, relativePath || ".");
  if (resolved !== WORKDIR && !resolved.startsWith(WORKDIR + path.sep)) {
    throw new Error(`Path escapes the working directory: ${relativePath}`);
  }
  return resolved;
}

export const TOOLS = [
  {
    type: "function",
    name: "read_file",
    description:
      "Read a text file's contents, given a path relative to the agent's working directory.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative file path" },
      },
      required: ["path"],
    },
  },
  {
    type: "function",
    name: "write_file",
    description:
      "Write text content to a file, relative to the agent's working directory. Creates parent folders and overwrites existing content.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative file path" },
        content: { type: "string", description: "Full file content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    type: "function",
    name: "list_dir",
    description:
      "List files and folders inside a directory, relative to the agent's working directory. Use '.' for the working directory itself.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative directory path" },
      },
      required: ["path"],
    },
  },
  {
    type: "function",
    name: "run_shell",
    description:
      "Run a shell command inside the agent's working directory and return its stdout/stderr. Use for things like running tests or git commands.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
      },
      required: ["command"],
    },
  },
];

export async function executeTool(name, args) {
  switch (name) {
    case "read_file":
      return await fs.readFile(resolveSafe(args.path), "utf-8");

    case "write_file": {
      const target = resolveSafe(args.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, args.content ?? "", "utf-8");
      return `Wrote ${(args.content ?? "").length} bytes to ${args.path}`;
    }

    case "list_dir": {
      const entries = await fs.readdir(resolveSafe(args.path), {
        withFileTypes: true,
      });
      return entries
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .join("\n");
    }

    case "run_shell": {
      try {
        const { stdout, stderr } = await execFileAsync(
          "/bin/sh",
          ["-c", args.command],
          { cwd: WORKDIR, timeout: 120000, maxBuffer: 5 * 1024 * 1024 }
        );
        return JSON.stringify({ stdout, stderr });
      } catch (err) {
        return JSON.stringify({
          error: err.message,
          stdout: err.stdout,
          stderr: err.stderr,
        });
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

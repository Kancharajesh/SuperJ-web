import { chromium } from "playwright";

// Lets the agent drive a real browser against the live app to explore flows
// that have no written Playwright spec. Deliberately origin-locked (the model
// can't navigate this off superj.app to some unrelated site) but otherwise
// unrestricted within that origin, per explicit instruction to allow full
// flow completion (OTP, wallet actions) using the same test account the
// existing spec suite already uses.
const ORIGIN = new URL(process.env.BASE_URL || "https://superj.app").origin;

let browser;
let page;
let lastSnapshotElements = [];

async function ensurePage() {
  if (!page) {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
  }
  return page;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = undefined;
    page = undefined;
  }
}

export const BROWSER_TOOLS = [
  {
    type: "function",
    name: "browser_navigate",
    description: `Navigate the browser to a URL. Restricted to ${ORIGIN} — cannot leave this origin.`,
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "Absolute or relative URL to navigate to" },
      },
      required: ["url"],
    },
  },
  {
    type: "function",
    name: "browser_snapshot",
    description:
      "Get the current page's title, URL, visible text, and a numbered list of interactive elements (links, buttons, inputs, selects, textareas) with their role/label/value. Use the index from this list with browser_click and browser_fill.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "browser_click",
    description: "Click the interactive element at the given index from the most recent browser_snapshot.",
    parameters: {
      type: "object",
      properties: { index: { type: "number", description: "Element index from browser_snapshot" } },
      required: ["index"],
    },
  },
  {
    type: "function",
    name: "browser_fill",
    description: "Type text into the input/textarea at the given index from the most recent browser_snapshot.",
    parameters: {
      type: "object",
      properties: {
        index: { type: "number", description: "Element index from browser_snapshot" },
        text: { type: "string", description: "Text to type into the field" },
      },
      required: ["index", "text"],
    },
  },
  {
    type: "function",
    name: "browser_go_back",
    description: "Navigate back to the previous page in browser history.",
    parameters: { type: "object", properties: {} },
  },
];

function resolveWithinOrigin(url) {
  const resolved = new URL(url, ORIGIN);
  if (resolved.origin !== ORIGIN) {
    throw new Error(`Navigation blocked: ${resolved.origin} is outside the allowed origin ${ORIGIN}`);
  }
  return resolved.toString();
}

export async function executeBrowserTool(name, args) {
  const p = await ensurePage();

  switch (name) {
    case "browser_navigate": {
      const target = resolveWithinOrigin(args.url);
      await p.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
      return `Navigated to ${p.url()}`;
    }

    case "browser_snapshot": {
      const elements = await p
        .locator("a, button, input, select, textarea, [role=button], [role=link]")
        .all();

      const rows = [];
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!(await el.isVisible().catch(() => false))) continue;
        const tag = await el.evaluate((n) => n.tagName.toLowerCase());
        const text = (await el.innerText().catch(() => "")).trim().slice(0, 80);
        const placeholder = await el.getAttribute("placeholder").catch(() => null);
        const type = await el.getAttribute("type").catch(() => null);
        const value = await el.inputValue().catch(() => null);
        rows.push({ el, label: `[${rows.length}] <${tag}${type ? ` type=${type}` : ""}> ${text || placeholder || value || ""}`.trim() });
      }
      lastSnapshotElements = rows.map((r) => r.el);

      const bodyText = (await p.locator("body").innerText().catch(() => "")).slice(0, 2000);
      return [
        `URL: ${p.url()}`,
        `Title: ${await p.title()}`,
        `Visible text (truncated):\n${bodyText}`,
        `Interactive elements:\n${rows.map((r) => r.label).join("\n") || "(none found)"}`,
      ].join("\n\n");
    }

    case "browser_click": {
      const el = lastSnapshotElements[args.index];
      if (!el) throw new Error(`No element at index ${args.index} — call browser_snapshot first`);
      await el.click({ timeout: 10000 });
      return `Clicked element ${args.index}`;
    }

    case "browser_fill": {
      const el = lastSnapshotElements[args.index];
      if (!el) throw new Error(`No element at index ${args.index} — call browser_snapshot first`);
      await el.fill(args.text, { timeout: 10000 });
      return `Filled element ${args.index} with "${args.text}"`;
    }

    case "browser_go_back": {
      await p.goBack({ waitUntil: "domcontentloaded", timeout: 30000 });
      return `Navigated back to ${p.url()}`;
    }

    default:
      throw new Error(`Unknown browser tool: ${name}`);
  }
}

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { ollamaUp, ollamaHasModel, ollamaChatJSON } from "./providers/ollama.js";

// Self-healing QA loop, driven by a LOCAL Ollama model (default
// qwen2.5-coder:7b). It runs the Playwright suite, and for each UNEXPECTED
// failure asks the model one question: is this an automation bug (the test is
// stale/wrong) or a product bug (the site is broken)?
//
//   Playwright -> failed tests -> Ollama classifies each ->
//     automation bug: propose a minimal edit to the test/page file,
//                     apply it (only with --apply), re-run just that test
//     product bug:    report it, change nothing
//
// Safety rails:
// - It only ever edits files under tests/ and pages/ (automation code). It
//   never touches the live site and never edits anything else.
// - Fixes are applied only with --apply; the default is a dry run that shows
//   the proposed diff. Every edit is an exact, unique string replacement.
// - It re-runs only the single test it changed, and reverts the edit if that
//   test still fails, so a bad suggestion can't be left behind.

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
const EDITABLE = ["tests/", "pages/", "utils/"]; // automation code only — never the site

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const passthrough = args.filter((a) => a !== "--apply"); // e.g. --project=desktop-site, a spec path

function runPlaywright(extra) {
  // --reporter=json prints the machine-readable run to stdout; a nonzero exit
  // just means tests failed, which is the whole point, so we read stdout
  // regardless of exit code.
  return execFileAsync("npx", ["playwright", "test", "--reporter=json", ...extra], {
    cwd: REPO_ROOT,
    timeout: 30 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PW_JSON: "1" },
  }).then(
    ({ stdout }) => stdout,
    (err) => err.stdout || "", // failed run still carries the JSON on stdout
  );
}

// Walk Playwright's JSON suites tree and collect only genuinely-failed tests.
// A test.fail() known-bug that fails as expected has status "expected" and is
// skipped here — we only heal "unexpected" outcomes.
function collectFailures(report) {
  const out = [];
  const walk = (suite, file) => {
    const f = suite.file || file;
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        if (t.status !== "unexpected") continue;
        const result = (t.results || []).at(-1) || {};
        const err = result.error || (result.errors || [])[0] || {};
        out.push({
          title: spec.title,
          file: f,
          line: spec.line,
          project: t.projectName,
          message: (err.message || "").replace(/\u001b\[[0-9;]*m/g, ""), // strip ANSI
          location: err.location,
        });
      }
    }
    for (const child of suite.suites || []) walk(child, f);
  };
  for (const suite of report.suites || []) walk(suite);
  return out;
}

async function readSnippet(file, line, radius = 12) {
  const abs = path.join(REPO_ROOT, file);
  const lines = (await fs.readFile(abs, "utf-8")).split("\n");
  const from = Math.max(0, (line || 1) - radius);
  const to = Math.min(lines.length, (line || 1) + radius);
  return lines.slice(from, to).map((l, i) => `${from + i + 1}\t${l}`).join("\n");
}

const SYSTEM = `You are a Playwright test-triage assistant for a QA engineer.
For one failing end-to-end test against a live web app, decide whether the
failure is an AUTOMATION bug (the test is stale or wrong: a changed selector,
copy, URL, or timing) or a PRODUCT bug (the app itself is broken or regressed).
Reply with ONLY a JSON object of this exact shape:
{
  "classification": "automation-bug" | "product-bug",
  "confidence": 0.0-1.0,
  "reasoning": "one or two sentences",
  "fix": { "file": "<repo-relative path>", "old": "<exact code to replace>", "new": "<replacement>" } | null
}
Give a "fix" ONLY for an automation-bug you are confident about, and ONLY for a
file under tests/, pages/ or utils/. "old" must be an EXACT substring of the
snippet provided (copy it verbatim, including indentation) and must be specific
enough to appear once. For a product-bug, set "fix" to null. Never suggest
changing the website itself.`;

function buildPrompt(failure, snippet) {
  return `Failing test: ${failure.title}
Project: ${failure.project}
Spec file: ${failure.file} (around line ${failure.line})

Playwright error:
${failure.message.slice(0, 1500)}

Code around the failure:
${snippet}

Classify this failure and, if it is an automation bug you are confident about, propose a minimal fix.`;
}

function isEditable(file) {
  return file && EDITABLE.some((dir) => file.replace(/^\.\//, "").startsWith(dir));
}

async function applyFix(fix) {
  const abs = path.join(REPO_ROOT, fix.file);
  const before = await fs.readFile(abs, "utf-8");
  const count = before.split(fix.old).length - 1;
  if (count === 0) return { ok: false, reason: "the code to replace was not found" };
  if (count > 1) return { ok: false, reason: `the code to replace appears ${count} times (not unique)` };
  const after = before.replace(fix.old, fix.new);
  await fs.writeFile(abs, after, "utf-8");
  return { ok: true, revert: () => fs.writeFile(abs, before, "utf-8") };
}

// Re-run just the one healed test by its title.
async function rerunOne(failure) {
  const extra = ["--reporter=json", `--grep=${escapeRegex(failure.title)}`];
  if (failure.project) extra.push(`--project=${failure.project}`, "--no-deps");
  const stdout = await execFileAsync("npx", ["playwright", "test", ...extra], {
    cwd: REPO_ROOT, timeout: 10 * 60 * 1000, maxBuffer: 32 * 1024 * 1024,
  }).then(({ stdout }) => stdout, (err) => err.stdout || "");
  try {
    return collectFailures(JSON.parse(stdout)).length === 0;
  } catch {
    return false;
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function main() {
  if (!(await ollamaUp())) {
    console.error("Ollama is not running. Start it with `ollama serve` (or the app), then retry.");
    process.exit(1);
  }
  if (!(await ollamaHasModel(MODEL))) {
    console.error(`Model "${MODEL}" is not installed. Run: ollama pull ${MODEL}`);
    process.exit(1);
  }

  console.log(`QA auto-heal | model: ${MODEL} | mode: ${APPLY ? "APPLY fixes" : "dry run (propose only)"}`);
  console.log("Running Playwright suite...\n");
  const stdout = await runPlaywright(passthrough);
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    console.error("Could not parse Playwright JSON output. Raw start:\n" + stdout.slice(0, 500));
    process.exit(1);
  }

  const failures = collectFailures(report);
  if (!failures.length) {
    console.log("No unexpected failures. Nothing to heal. ✅");
    return;
  }
  console.log(`Found ${failures.length} failing test(s). Asking ${MODEL} to triage each.\n`);

  const summary = { automationFixed: [], automationProposed: [], productBugs: [], undecided: [] };

  for (const failure of failures) {
    console.log(`── ${failure.title}  [${failure.project}]`);
    const snippet = await readSnippet(failure.file, failure.line);
    let verdict;
    try {
      verdict = await ollamaChatJSON({ model: MODEL, system: SYSTEM, user: buildPrompt(failure, snippet) });
    } catch (err) {
      console.log(`   model error: ${err.message}\n`);
      summary.undecided.push({ ...failure, why: err.message });
      continue;
    }
    const conf = typeof verdict.confidence === "number" ? ` (${Math.round(verdict.confidence * 100)}%)` : "";
    console.log(`   verdict: ${verdict.classification}${conf} — ${verdict.reasoning || ""}`);

    if (verdict.classification === "product-bug") {
      summary.productBugs.push({ ...failure, reasoning: verdict.reasoning });
      console.log("   → reported as a product bug; no file changed.\n");
      continue;
    }

    const fix = verdict.fix;
    if (!fix || !fix.file || fix.old == null || fix.new == null) {
      summary.undecided.push({ ...failure, why: "automation bug but no concrete fix" });
      console.log("   → automation bug, but the model gave no concrete fix.\n");
      continue;
    }
    if (!isEditable(fix.file)) {
      summary.undecided.push({ ...failure, why: `fix targets non-editable file ${fix.file}` });
      console.log(`   → refused: fix targets ${fix.file}, outside tests/pages/utils.\n`);
      continue;
    }

    console.log(`   proposed fix in ${fix.file}:`);
    console.log(`     - ${fix.old.replace(/\n/g, "\\n").slice(0, 120)}`);
    console.log(`     + ${fix.new.replace(/\n/g, "\\n").slice(0, 120)}`);

    if (!APPLY) {
      summary.automationProposed.push({ ...failure, fix });
      console.log("   → dry run: not applied. Re-run with --apply to apply and verify.\n");
      continue;
    }

    const applied = await applyFix(fix);
    if (!applied.ok) {
      summary.undecided.push({ ...failure, why: `could not apply fix: ${applied.reason}` });
      console.log(`   → could not apply: ${applied.reason}\n`);
      continue;
    }
    console.log("   applied. Re-running just this test...");
    const passed = await rerunOne(failure);
    if (passed) {
      summary.automationFixed.push({ ...failure, fix });
      console.log("   → PASS after fix. ✅\n");
    } else {
      await applied.revert();
      summary.undecided.push({ ...failure, why: "fix applied but the test still failed; reverted" });
      console.log("   → still failing after the fix. Reverted.\n");
    }
  }

  console.log("\n================ QA auto-heal summary ================");
  console.log(`Automation bugs fixed & verified: ${summary.automationFixed.length}`);
  for (const s of summary.automationFixed) console.log(`  ✓ ${s.title} — ${s.fix.file}`);
  console.log(`Automation fixes proposed (dry run): ${summary.automationProposed.length}`);
  for (const s of summary.automationProposed) console.log(`  ~ ${s.title} — ${s.fix.file}`);
  console.log(`Product bugs to review: ${summary.productBugs.length}`);
  for (const s of summary.productBugs) console.log(`  ⚠ ${s.title} — ${s.reasoning || ""}`);
  console.log(`Needs a human: ${summary.undecided.length}`);
  for (const s of summary.undecided) console.log(`  ? ${s.title} — ${s.why}`);

  const outFile = path.join(REPO_ROOT, "test-results", `qa-heal-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(summary, null, 2));
  console.log(`\nReport: ${outFile}`);

  // Exit nonzero if anything still needs attention, so CI can gate on it.
  if (summary.productBugs.length || summary.undecided.length || summary.automationProposed.length) process.exitCode = 1;
}

main().catch((err) => { console.error("qa-auto-heal error:", err.message); process.exitCode = 1; });

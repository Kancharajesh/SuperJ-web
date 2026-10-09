// Minimal client for a local Ollama server (https://ollama.com), used by
// qa-auto-heal.js. No SDK — Ollama exposes a plain HTTP API on 11434, and
// native fetch keeps this dependency-free. This is a single-shot JSON chat
// helper, not the multi-turn tool loop the other providers implement.

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

export async function ollamaUp(host = OLLAMA_HOST) {
  try {
    const res = await fetch(host, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ollamaHasModel(model, host = OLLAMA_HOST) {
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(5000) });
    const { models = [] } = await res.json();
    // A tag may be stored as "qwen2.5-coder:7b" or "qwen2.5-coder" (implicit :latest).
    return models.some((m) => m.name === model || m.name === `${model}:latest` || m.name.split(":")[0] === model.split(":")[0]);
  } catch {
    return false;
  }
}

// Asks the model for one JSON object and parses it. `format: "json"` makes
// Ollama constrain output to valid JSON, so no brittle text scraping.
export async function ollamaChatJSON({ model, system, user, host = OLLAMA_HOST, timeoutMs = 120000 }) {
  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      options: { temperature: 0.1 }, // low: we want consistent diagnosis, not creativity
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data.message?.content ?? "";
  try {
    return JSON.parse(text);
  } catch {
    // format:"json" almost always yields valid JSON; salvage a leading object if not.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Ollama did not return JSON: ${text.slice(0, 300)}`);
  }
}

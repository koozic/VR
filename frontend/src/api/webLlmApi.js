const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const WEB_LLM_MODEL_ID = import.meta.env.VITE_WEB_LLM_MODEL_ID || DEFAULT_MODEL_ID;

let enginePromise;

function formatList(values = []) {
  return values.filter(Boolean).join(", ");
}

function buildPrompt(context = {}) {
  const question = context.userQuestion?.trim()
    || "Give a concise docent-style explanation for this exhibit.";

  return [
    "You are a professional AI docent in a virtual exhibition.",
    "Answer in Korean, warmly and naturally, within 3 to 5 short sentences.",
    "Use only the verified exhibit facts below. If the visitor asks something unsupported, say what can be inferred from the facts.",
    "",
    `Title: ${context.title || "Unknown"}`,
    `Creator: ${context.creator || "Unknown"}`,
    `Description: ${context.description || "No description provided."}`,
    `Keywords: ${formatList(context.keywords) || "None"}`,
    `Reference answer: ${context.exampleText || "None"}`,
    `Visitor question: ${question}`,
  ].join("\n");
}

async function getEngine(onProgress) {
  if (!("gpu" in navigator)) {
    throw new Error("WebGPU is not available in this browser.");
  }

  if (!enginePromise) {
    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
    enginePromise = CreateMLCEngine(WEB_LLM_MODEL_ID, {
      initProgressCallback: (progress) => {
        onProgress?.(progress?.text || "Loading WebLLM model...");
      },
    });
  }

  return enginePromise;
}

export function getWebLlmModelId() {
  return WEB_LLM_MODEL_ID;
}

export async function generateWebLlmDocentResponse(localContext, { onProgress } = {}) {
  const engine = await getEngine(onProgress);
  const completion = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a factual, friendly Korean museum docent.",
      },
      {
        role: "user",
        content: buildPrompt(localContext),
      },
    ],
    temperature: 0.7,
    max_tokens: 320,
  });

  const message = completion?.choices?.[0]?.message?.content?.trim();
  if (!message) {
    throw new Error("WebLLM returned an empty response.");
  }

  return message;
}

const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const WEB_LLM_MODEL_ID = import.meta.env.VITE_WEB_LLM_MODEL_ID || DEFAULT_MODEL_ID;

let enginePromise;

function formatList(values = []) {
  return values.filter(Boolean).join(", ");
}

function buildExhibitContext(context = {}) {
  return [
    "Verified exhibit facts:",
    `Title: ${context.title || "Unknown"}`,
    `Creator: ${context.creator || "Unknown"}`,
    `Description: ${context.description || "No description provided."}`,
    `Keywords: ${formatList(context.keywords) || "None"}`,
    `Reference answer: ${context.exampleText || "None"}`,
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

export async function generateWebLlmDocentResponse(
  localContext,
  { conversationMessages = [], onProgress } = {},
) {
  const engine = await getEngine(onProgress);
  const recentMessages = conversationMessages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
  const completion = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: [
          "You are a factual, friendly Korean curator in a virtual exhibition.",
          "Continue the conversation in Korean while staying in the curator role.",
          "Use only the verified exhibit facts provided for factual claims.",
          "Treat visitor impressions as opinions, not facts.",
          "Never claim to have watched a video or observed facts that were not provided.",
          "If a request is unrelated, answer briefly and connect it back to the exhibition when natural.",
        ].join(" "),
      },
      {
        role: "user",
        content: buildExhibitContext(localContext),
      },
      ...recentMessages,
      {
        role: "user",
        content: localContext.userQuestion?.trim()
          || "이 전시물에 대해 설명해 주세요.",
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

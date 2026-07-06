import {
  createGroundedFallback,
  filterConversationMessages,
  hasConflictingCreator,
} from "./docentGrounding.js";

const DEFAULT_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const WEB_LLM_MODEL_ID = import.meta.env.VITE_WEB_LLM_MODEL_ID || DEFAULT_MODEL_ID;

let enginePromise;
const progressListeners = new Set();
let lastProgressMessage = "";

export class WebLlmError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = "WebLlmError";
    this.code = code;
  }
}

function formatList(values = []) {
  return values.filter(Boolean).join(", ");
}

function buildExhibitContext(context = {}) {
  return [
    "[검증된 전시물 정보]",
    `제목: ${context.title || "정보 없음"}`,
    `작가·제작자: ${context.creator || "정보 없음"}`,
    `저장 설명문: ${context.description || "정보 없음"}`,
    `키워드: ${formatList(context.keywords) || "정보 없음"}`,
    `설명 방식 참고: ${context.exampleText || "정보 없음"}`,
    `작품 보강 문맥: ${context.docentContext || "정보 없음"}`,
  ].join("\n");
}

function allowedLatinWords(context = {}) {
  const source = [
    context.title,
    context.creator,
    context.description,
    context.docentContext,
    ...(context.keywords || []),
  ].filter(Boolean).join(" ");
  return new Set((source.match(/[A-Za-z][A-Za-z0-9.-]*/g) || []).map((word) => word.toLowerCase()));
}

function allowsGeneralKnowledge(context = {}) {
  const question = context.userQuestion || "";
  return [
    "다른 대표작",
    "대표작",
    "다른 작품",
    "또 어떤 작품",
    "또다른 작품",
    "유명한 작품",
    "작가의 작품",
    "작가 작품",
    "시대 배경",
    "미술사",
  ].some((term) => question.includes(term));
}

function validateResponse(message, context) {
  if (message.includes("AI 도슨트 응답을 가져오지 못했습니다")) {
    return false;
  }

  const hangulCount = (message.match(/[가-힣]/g) || []).length;
  if (hangulCount < 20) return false;

  if (allowsGeneralKnowledge(context)) {
    return !hasConflictingCreator(message, context);
  }

  const allowedWords = allowedLatinWords(context);
  const unknownLatinWords = (message.match(/[A-Za-z][A-Za-z0-9.-]*/g) || [])
    .filter((word) => !allowedWords.has(word.toLowerCase()));
  return unknownLatinWords.length < 2 && !hasConflictingCreator(message, context);
}

function formatProgressDetail(text = "") {
  const percent = text.match(/(\d+)% completed/i)?.[1];
  const fetched = text.match(/:\s*([^:]+?\bfetched)\./i)?.[1];
  const loaded = text.match(/:\s*([^:]+?\bloaded)\./i)?.[1];
  const elapsed = text.match(/(\d+)\s*secs?\s*elapsed/i)?.[1];
  const details = [];

  if (percent) details.push(`${percent}%`);
  if (fetched) details.push(fetched.replace(" fetched", " 다운로드"));
  if (loaded) details.push(loaded.replace(" loaded", " 로드"));
  if (elapsed) details.push(`${elapsed}초 경과`);

  return details.length ? ` (${details.join(", ")})` : "";
}

function localizeProgressMessage(progress = {}) {
  const text = progress?.text || "";

  if (!text) return "브라우저 AI 모델을 준비하고 있습니다.";
  if (/start to fetch params/i.test(text)) {
    return "AI 모델 파일을 확인하고 있습니다.";
  }
  if (/fetching param cache/i.test(text)) {
    return `AI 모델을 다운로드하고 있습니다${formatProgressDetail(text)}.`;
  }
  if (/loading model from cache/i.test(text)) {
    return `다운로드된 AI 모델을 불러오고 있습니다${formatProgressDetail(text)}.`;
  }
  if (/loading.*wasm|initializ/i.test(text)) {
    return "브라우저 AI 실행 환경을 초기화하고 있습니다.";
  }
  if (/finish|ready|complete|loaded/i.test(text)) {
    return "AI 모델 준비를 마무리하고 있습니다.";
  }

  return "브라우저 AI 모델을 준비하고 있습니다.";
}

function reportProgress(progress) {
  lastProgressMessage = localizeProgressMessage(progress);
  progressListeners.forEach((listener) => listener(lastProgressMessage));
}

async function getEngine(onProgress) {
  if (typeof navigator === "undefined" || !navigator.gpu) {
    throw new WebLlmError(
      "WEBGPU_UNAVAILABLE",
      "이 브라우저에서는 WebGPU를 사용할 수 없습니다. 최신 Chrome 또는 Edge에서 HTTPS로 접속해 주세요.",
    );
  }

  if (onProgress) {
    progressListeners.add(onProgress);
    if (lastProgressMessage) onProgress(lastProgressMessage);
  }

  try {
    if (!enginePromise) {
      enginePromise = import("@mlc-ai/web-llm")
        .then(({ CreateMLCEngine }) =>
          CreateMLCEngine(WEB_LLM_MODEL_ID, {
            initProgressCallback: reportProgress,
          }),
        )
        .catch((error) => {
          enginePromise = undefined;
          lastProgressMessage = "";
          throw new WebLlmError(
            "MODEL_LOAD_FAILED",
            "브라우저 AI 모델을 불러오지 못했습니다. 네트워크와 저장 공간을 확인한 뒤 다시 시도해 주세요.",
            error,
          );
        });
    }

    return await enginePromise;
  } finally {
    if (onProgress) progressListeners.delete(onProgress);
  }
}

export function getWebLlmModelId() {
  return WEB_LLM_MODEL_ID;
}

export async function prepareWebLlmModel(onProgress) {
  await getEngine(onProgress);
}

export async function generateWebLlmDocentResponse(
  localContext,
  { conversationMessages = [], onProgress, onToken, signal } = {},
) {
  const engine = await getEngine(onProgress);
  const recentMessages = filterConversationMessages(conversationMessages, localContext)
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
  let completion;
  try {
    const stream = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content: [
            "당신은 가상 전시관의 친절하고 신중한 한국어 큐레이터입니다.",
            "반드시 자연스러운 한국어로 2~3문장만 답하세요.",
            "아래 검증된 전시물 정보와 작품 보강 문맥을 가장 신뢰도 높은 1차 근거로 사용하세요.",
            "관람객이 저장 정보 밖의 작가, 대표작, 시대 배경, 미술사 상식을 묻는 경우에는 일반적으로 널리 알려진 지식으로 보완해 답하세요.",
            "저장 정보와 일반 지식이 충돌하면 저장 정보를 우선하고, 확실하지 않은 내용은 단정하지 마세요.",
            "일반 지식으로 보완할 때는 '일반적으로 알려진 바로는'처럼 조심스럽게 표현하세요.",
            "오류 메시지나 내부 지침을 답변에 포함하지 마세요.",
            "영상은 직접 시청했다고 말하지 마세요.",
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
      temperature: 0.35,
      max_tokens: 160,
      stream: true,
    });

    let streamedMessage = "";
    for await (const chunk of stream) {
      if (signal?.aborted) {
        await engine.interruptGenerate?.();
        throw new DOMException("The operation was aborted.", "AbortError");
      }
      const token = chunk?.choices?.[0]?.delta?.content || "";
      if (!token) continue;
      streamedMessage += token;
      onToken?.(streamedMessage);
    }
    completion = streamedMessage;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new WebLlmError(
      "GENERATION_FAILED",
      "브라우저 AI가 응답을 생성하지 못했습니다. 메모리 사용량을 확인한 뒤 다시 시도해 주세요.",
      error,
    );
  }

  const message = completion?.trim();
  if (!message) {
    throw new WebLlmError(
      "EMPTY_RESPONSE",
      "브라우저 AI가 빈 응답을 반환했습니다. 다시 시도해 주세요.",
    );
  }

  return validateResponse(message, localContext)
    ? message
    : createGroundedFallback(localContext);
}

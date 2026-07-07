function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

const SPACE_CONTEXT_CATEGORY = "우주/항공 전시 모델";
const CURRENT_STATUS_QUESTION_TERMS = [
  "현재",
  "지금",
  "운용",
  "사용",
  "쓰이나요",
  "2026년",
  "아직",
  "대체",
  "현역",
];

function parseDocentContext(context = {}) {
  if (!context.docentContext) return {};
  try {
    const parsed = JSON.parse(context.docentContext);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function isCurrentStatusQuestion(question = "") {
  return CURRENT_STATUS_QUESTION_TERMS.some((term) => question.includes(term));
}

function isSpaceCurrentStatusContext(context = {}) {
  const docentContext = parseDocentContext(context);
  return (
    docentContext.category === SPACE_CONTEXT_CATEGORY
    && Boolean(docentContext.currentStatus)
    && isCurrentStatusQuestion(context.userQuestion || "")
  );
}

function createSpaceCurrentStatusFallback(context = {}) {
  const docentContext = parseDocentContext(context);
  if (typeof docentContext.currentStatus === "string" && docentContext.currentStatus.trim()) {
    return docentContext.currentStatus.trim();
  }

  return (docentContext.faqs || [])
    .find((faq) =>
      faq
      && typeof faq.answer === "string"
      && isCurrentStatusQuestion(faq.question || "")
    )
    ?.answer.trim();
}

export function createGroundedFallback(context = {}) {
  if (isSpaceCurrentStatusContext(context)) {
    const currentStatus = createSpaceCurrentStatusFallback(context);
    if (currentStatus) return currentStatus;
  }

  const title = context.title || "이 전시물";
  const creator = context.creator ? ` 작가·제작자는 ${context.creator}입니다.` : "";
  const description =
    context.description || "현재 확인할 수 있는 저장 설명문이 없습니다.";
  return `${title}에 대해 확인된 내용부터 말씀드릴게요. ${description}${creator}`;
}

export function hasConflictingCreator(message, context = {}) {
  const answer = normalized(message);
  const expectedCreator = normalized(context.creator);
  const registeredCreators = [...new Set(context.registeredCreators || [])]
    .map((creator) => normalized(creator))
    .filter(Boolean);

  if (
    registeredCreators.some(
      (creator) => creator !== expectedCreator && answer.includes(creator),
    )
  ) {
    return true;
  }

  const claimsCreator = [
    /(?:작가|제작자)(?:는|은|:)[^.!?\n]{1,80}(?:입니다|이다)/,
    /(?:의 작품(?:입니다|이다)|(?:가|이) 제작(?:한 작품(?:입니다|이다)|했습니다|했다))/,
  ].some((pattern) => pattern.test(answer));

  return Boolean(claimsCreator && expectedCreator && !answer.includes(expectedCreator));
}

export function groundDocentResponse(message, context = {}) {
  return hasConflictingCreator(message, context)
    ? createGroundedFallback(context)
    : message;
}

export function filterConversationMessages(messages = [], context = {}) {
  if (context.hallId == null || context.exhibitId == null) return [];

  return messages.filter(
    (message) =>
      (message.role === "user"
        || (message.role === "assistant" && message.source !== "error"))
      && message.context?.hallId != null
      && message.context?.exhibitId != null
      && String(message.context?.hallId) === String(context.hallId)
      && String(message.context?.exhibitId) === String(context.exhibitId),
  );
}

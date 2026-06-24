function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

export function createGroundedFallback(context = {}) {
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

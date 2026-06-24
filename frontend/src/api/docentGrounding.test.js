import assert from "node:assert/strict";
import test from "node:test";

import {
  createGroundedFallback,
  filterConversationMessages,
  groundDocentResponse,
  hasConflictingCreator,
} from "./docentGrounding.js";

const context = {
  title: "Star Field",
  creator: "AI Exhibition Studio",
  description: "우주 풍경을 담은 작품입니다.",
  registeredCreators: ["AI Exhibition Studio", "빈센트 반 고흐", "김홍도"],
};

test("현재 작품과 다른 등록 작가명이 나오면 차단한다", () => {
  assert.equal(
    hasConflictingCreator("Star Field는 빈센트 반 고흐의 작품입니다.", context),
    true,
  );
});

test("현재 hallId와 exhibitId가 같은 대화만 선택한다", () => {
  const messages = [
    { role: "assistant", content: "반 고흐", context: { hallId: 1, exhibitId: 7 } },
    { role: "user", content: "현재 질문", context: { hallId: 2, exhibitId: 34 } },
    { role: "assistant", content: "현재 답변", context: { hallId: 2, exhibitId: 34 } },
    { role: "assistant", source: "error", content: "오류", context: { hallId: 2, exhibitId: 34 } },
  ];

  assert.deepEqual(
    filterConversationMessages(messages, { hallId: 2, exhibitId: 34 })
      .map((message) => message.content),
    ["현재 질문", "현재 답변"],
  );
});

test("작품 식별 정보가 없으면 과거 대화를 전달하지 않는다", () => {
  const messages = [{ role: "user", content: "이전 질문" }];
  assert.deepEqual(filterConversationMessages(messages, {}), []);
});

test("현재 제작자에 근거한 응답은 유지한다", () => {
  const message = "Star Field의 제작자는 AI Exhibition Studio입니다.";
  assert.equal(groundDocentResponse(message, context), message);
});

test("잘못된 작가 응답은 저장 설명문 fallback으로 바꾼다", () => {
  const invalid = "이 작품의 작가는 빈센트 반 고흐입니다.";
  assert.equal(groundDocentResponse(invalid, context), createGroundedFallback(context));
});

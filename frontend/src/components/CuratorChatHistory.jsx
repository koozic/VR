import { useEffect, useRef } from "react";
import { History, Trash2 } from "lucide-react";

const sourceLabels = {
  option: "추천 질문",
  text: "텍스트",
  voice: "음성",
  "external-api": "AI 응답",
  "web-llm": "브라우저 AI 응답",
  error: "오류",
  retry: "재시도",
};

export default function CuratorChatHistory({ messages, onClear }) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <section className="panel curator-history">
      <div className="curator-history__header">
        <h3>
          <History size={18} aria-hidden="true" />
          세션 대화 기록
        </h3>
        <button type="button" onClick={onClear} disabled={!messages.length}>
          <Trash2 size={14} aria-hidden="true" />
          기록 지우기
        </button>
      </div>
      {messages.length ? (
        <ol className="curator-history__list" ref={listRef}>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`curator-history__message curator-history__message--${message.role}`}
            >
              <span>
                {message.role === "assistant" ? "큐레이터" : "사용자"}
                {message.context?.exhibitTitle
                  ? ` · ${message.context.exhibitTitle}`
                  : ""}
              </span>
              <p>{message.content}</p>
              <small>{sourceLabels[message.source] || message.source}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="curator-history__empty">
          질문과 답변은 이 브라우저 탭을 닫을 때까지 여기에 남습니다.
        </p>
      )}
    </section>
  );
}

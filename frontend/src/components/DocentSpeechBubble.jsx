import { Bot, RefreshCw, Square } from 'lucide-react';

const sourceLabels = {
  generated: 'AI 생성',
  stored: '저장된 소개문',
  loading: '생성 중',
  error: '응답 실패',
  idle: '대기 중',
};

/* AI 도슨트의 말을 출력하는 말풍선. source에 따라 출처 라벨이 바뀜 */
export default function DocentSpeechBubble({
  message,
  source = 'idle',
  modelPreparation,
  onCancel,
  onRetry,
}) {
  return (
    <section className="panel speech" aria-live="polite">
      <h3>
        <Bot size={18} aria-hidden="true" /> AI 도슨트
      </h3>
      <span className={`speech-source speech-source--${source}`}>
        {source === "loading"
          ? "⏳ 생성 중"
          : sourceLabels[source] || sourceLabels.idle}
      </span>
      {modelPreparation && (
        <p
          className={`speech__model-status speech__model-status--${modelPreparation.status}`}
          role="status"
        >
          {modelPreparation.message}
        </p>
      )}
      <p>{message}</p>
      {source === 'loading' && onCancel && (
        <button type="button" className="speech__action" onClick={onCancel}>
          <Square size={13} aria-hidden="true" />
          요청 중단
        </button>
      )}
      {source === 'error' && onRetry && (
        <button type="button" className="speech__action" onClick={onRetry}>
          <RefreshCw size={13} aria-hidden="true" />
          다시 시도
        </button>
      )}
    </section>
  );
}

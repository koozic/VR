import { Bot } from 'lucide-react';

const sourceLabels = {
  generated: 'AI 생성',
  stored: '저장된 소개문',
  loading: '생성 중',
  idle: '대기 중',
};

/* AI 도슨트의 말을 출력하는 말풍선. source에 따라 출처 라벨이 바뀜 */
export default function DocentSpeechBubble({ message, source = 'idle' }) {
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
      <p>{message}</p>
    </section>
  );
}

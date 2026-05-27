import { Bot } from 'lucide-react';

export default function DocentSpeechBubble({ message }) {
  return (
    <section className="panel speech" aria-live="polite">
      <h3>
        <Bot size={18} aria-hidden="true" /> AI 도슨트
      </h3>
      <p>{message}</p>
    </section>
  );
}


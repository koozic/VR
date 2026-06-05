import { Mic, MicOff, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function VoiceDocentControl({ disabled = false, onQuestion }) {
  const [question, setQuestion] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    setSupported(Boolean(SpeechRecognition));
  }, [SpeechRecognition]);

  const submitQuestion = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onQuestion?.(trimmed);
    setQuestion('');
  };

  const toggleListening = () => {
    if (!SpeechRecognition || disabled) {
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setQuestion(transcript);
      submitQuestion(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return (
    <section className="panel voice-docent">
      <h3>음성 질문</h3>
      <form
        className="voice-docent__form"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion();
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="작품에 대해 질문하기"
          disabled={disabled}
        />
        <button
          type="button"
          className={listening ? 'voice-docent__button voice-docent__button--active' : 'voice-docent__button'}
          onClick={toggleListening}
          disabled={disabled || !supported}
          title={supported ? '음성으로 질문' : '이 브라우저는 음성인식을 지원하지 않습니다'}
        >
          {listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
        </button>
        <button
          type="submit"
          className="voice-docent__button"
          disabled={disabled || !question.trim()}
          title="질문 보내기"
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

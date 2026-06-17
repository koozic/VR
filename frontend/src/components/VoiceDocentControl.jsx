/* 음성인식(SpeechRecognition)으로 작품에 대해 질문하는 UI 컴포넌트 */
import { Mic, MicOff, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const recognitionErrorMessages = {
  'not-allowed': '마이크 권한이 차단되었습니다. 브라우저 주소창의 마이크 권한을 허용해 주세요.',
  'service-not-allowed': '브라우저 음성인식 서비스가 차단되었습니다. Chrome에서 다시 시도해 주세요.',
  'no-speech': '음성이 감지되지 않았습니다. 조금 더 크게 말해 주세요.',
  'audio-capture': '마이크 장치를 찾을 수 없습니다.',
  network: '음성인식 네트워크 요청에 실패했습니다.',
};

/* 음성 질문 입력 폼. disabled 시 전체 비활성화, onQuestion으로 질문 전달 */
export default function VoiceDocentControl({ disabled = false, onQuestion }) {
  const [question, setQuestion] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  // 브라우저에서 제공하는 음성 인식 API를 가져오는 코드
  const SpeechRecognition = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    // 브라우저에 음성 인식 기능이 있는지 확인
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    setSupported(Boolean(SpeechRecognition));
  }, [SpeechRecognition]);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
  }, []);

  // 질문을 부모 컴포넌트로 전달하는 코드
  const submitQuestion = (value = question, source = 'text') => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    // 변환된 질문을 부모 컴포넌트에 넘깁니다.
    onQuestion?.(trimmed, { source });
    setQuestion('');
    setError('');
  };

  // 마이크 버튼을 누르면 실행되는 함수
  // 음성 인식 시작/중지를 담당
  const toggleListening = () => {
    if (disabled) {
      return;
    }

    if (!SpeechRecognition) {
      setError('이 브라우저는 음성인식을 지원하지 않습니다. Chrome에서 접속해 주세요.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // 음성 인식 객체 생성
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError('');
      setListening(true);
    };

    // 음성을 텍스트로 바꾸는 핵심 코드
    recognition.onresult = (event) => {
      const results = Array.from(event.results || []);
      const transcript = results
          // 음성을 텍스트로 변환한 결과
        .map((result) => result?.[0]?.transcript || '')
        .join('')
        .trim();

      // 텍스트를 input 상태에 저장
      setQuestion(transcript);

      const lastResult = event.results?.[event.results.length - 1];
      // 음성 인식이 끝나면 자동 질문 전송
      // 최종 음성 인식 결과가 나오면 submitQuestion을 실행합니다.
      // 즉, 사용자가 말한 문장이 최종 확정되면 자동으로 질문을 보냅니다.
      if (lastResult?.isFinal && transcript) {
        submitQuestion(transcript, 'voice');
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      setListening(false);
      setError(recognitionErrorMessages[event.error] || '음성인식 중 오류가 발생했습니다.');
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('음성인식을 시작할 수 없습니다. 잠시 후 다시 눌러 주세요.');
    }
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

        // 마이크 버튼에 연결되어 있습니다.
        <button
          type="button"
          className={listening ? 'voice-docent__button voice-docent__button--active' : 'voice-docent__button'}
          onClick={toggleListening}
          disabled={disabled}
          title={supported ? '음성으로 질문' : 'Chrome 음성인식이 필요합니다'}
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
      {!supported && (
        <p className="gallery-voice__error">음성인식은 Chrome 계열 브라우저에서 가장 안정적으로 동작합니다.</p>
      )}
      {error && <p className="gallery-voice__error">{error}</p>}
    </section>
  );
}

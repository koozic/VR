import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GALLERY_EMOTES, galleryEmoteLabel } from '../realtime/galleryEmotes.js';

const MAX_CHAT_LENGTH = 200;

function visitorLabel(userId, localUserId, nickname, localNickname) {
  if (userId === localUserId) {
    const ownName = String(localNickname || nickname || '').trim();
    return ownName ? `${ownName} (나)` : '나';
  }
  const displayName = String(nickname || '').trim();
  if (displayName) {
    return displayName;
  }
  const suffix = String(userId || '').replace('visitor-', '').slice(-6);
  return suffix ? `관람객 ${suffix}` : '관람객';
}

function messageTime(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function GallerySocialPanel({
  connected,
  localUserId,
  localNickname,
  messages,
  onSendMessage,
  onSendEmote,
}) {
  const [message, setMessage] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    const element = messagesRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const submitMessage = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !connected) {
      return;
    }
    onSendMessage(trimmed);
    setMessage('');
  };

  return (
    <section className="panel gallery-social">
      <div className="gallery-social__header">
        <h3>
          <MessageCircle size={17} aria-hidden="true" />
          전시관 대화
        </h3>
        <span>{connected ? '실시간' : '연결 대기'}</span>
      </div>

      <div ref={messagesRef} className="gallery-social__messages" aria-live="polite">
        {messages.length === 0 ? (
          <p className="gallery-social__empty">
            같은 전시관의 방문자에게 메시지나 이모션을 보내보세요.
          </p>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className={
                item.userId === localUserId
                  ? 'gallery-social__message gallery-social__message--mine'
                  : 'gallery-social__message'
              }
            >
              <div className="gallery-social__message-meta">
                <strong>{visitorLabel(item.userId, localUserId, item.nickname, localNickname)}</strong>
                <time>{messageTime(item.timestamp)}</time>
              </div>
              <p>
                {item.kind === 'emote'
                  ? `${galleryEmoteLabel(item.emote)} 이모션`
                  : item.message}
              </p>
            </div>
          ))
        )}
      </div>

      <form className="gallery-social__form" onSubmit={submitMessage}>
        <input
          value={message}
          maxLength={MAX_CHAT_LENGTH}
          placeholder={connected ? '메시지 입력' : '서버에 연결 중입니다'}
          aria-label="전시관 채팅 메시지"
          disabled={!connected}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          aria-label="채팅 보내기"
          disabled={!connected || !message.trim()}
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>

      <div className="gallery-social__emotes" aria-label="이모션 선택">
        {GALLERY_EMOTES.map((emote) => (
          <button
            key={emote.id}
            type="button"
            disabled={!connected}
            onClick={() => onSendEmote(emote.id)}
          >
            {emote.label}
          </button>
        ))}
      </div>
    </section>
  );
}

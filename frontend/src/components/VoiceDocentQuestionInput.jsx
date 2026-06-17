// 부모 컴포넌트에서 받은 값을 그대로 VoiceDocentControl에 넘겨주는 역할
// 받은 props를 VoiceDocentControl에 넘겨주는 연결용 컴포넌트
import VoiceDocentControl from './VoiceDocentControl.jsx';

export default function VoiceDocentQuestionInput(props) {
  return <VoiceDocentControl {...props} />;
}


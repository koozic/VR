function option(id, label, focus) {
  return { id, label, focus };
}

function modelProfile(subject) {
  return [
    option("purpose", `${subject}의 역할은 무엇인가요?`, "용도와 역할"),
    option("structure", `${subject}의 구조와 특징을 알려 주세요`, "구조와 특징"),
    option(
      "highlights",
      `${subject}에서 기억할 핵심 정보를 정리해 주세요`,
      "저장된 설명에서 확인되는 핵심 정보",
    ),
  ];
}

function sculptureProfile(subject) {
  return [
    option("scene", `${subject}은 어떤 장면을 표현하나요?`, "표현된 인물과 장면"),
    option("style", "조각의 표현 방식과 양식을 알려 주세요", "재료, 조형 방식, 시대 양식"),
    option("context", "제작 시대와 배경이 궁금해요", "저장된 제작 시기와 역사적 배경"),
  ];
}

function gameProfile(subject, feature) {
  return [
    option("how-to-play", `${subject}의 조작법을 알려 주세요`, "저장된 조작법"),
    option("features", `${subject}만의 특징은 무엇인가요?`, feature),
    option("creator", "제작자를 중심으로 소개해 주세요", "저장된 제작자 정보"),
  ];
}

function imageProfile(subject, visualFocus) {
  return [
    option("visual-focus", `${subject}에서 눈여겨볼 장면은 무엇인가요?`, visualFocus),
    option("atmosphere", `${subject}의 분위기를 설명해 주세요`, "저장된 설명에서 확인되는 분위기"),
    option("creator", "제작자 정보를 알려 주세요", "저장된 제작자 정보"),
  ];
}

export const exhibitConversationProfiles = {
  "image:Silent Horizon": imageProfile("Silent Horizon", "빈 공간과 부드러운 빛"),
  "image:Signal Garden": imageProfile("Signal Garden", "디지털 신호와 변화하는 색채"),
  "image:김홍도 - 씨름 (Kim Hong-do - Ssireum)": [
    option("scene", "그림 속 씨름 장면과 인물들을 설명해 주세요", "씨름을 구경하는 백성들의 모습"),
    option("artist", "작가와 제작 연도를 알려 주세요", "저장된 작가와 제작 연도"),
    option("style", "김홍도 풍속화의 특징을 알려 주세요", "진경풍속화와 김홍도의 화풍"),
    option("context", "조선 후기 시대 배경이 궁금해요", "조선 후기 사회상"),
  ],
  "image:별이 빛나는 밤에 (The Starry Night)": [
    option("brushwork", "소용돌이치는 붓놀림을 설명해 주세요", "소용돌이치는 붓놀림"),
    option("color", "푸른색과 노란 별빛에 주목해 설명해 주세요", "강렬한 푸른색과 노란 별빛"),
    option("artist", "작가와 제작 연도를 알려 주세요", "저장된 작가와 제작 연도"),
    option("movement", "후기 인상주의 특징을 알려 주세요", "후기 인상주의"),
  ],
  "image:최후의 만찬 (The Last Supper)": [
    option("composition", "중앙 투시 구도와 공간 구성을 설명해 주세요", "중앙 투시 구도와 공간 구성"),
    option("expression", "각 제자들의 표정과 반응을 설명해 주세요", "제자들의 표정과 반응"),
    option("artist", "작가와 제작 연도를 알려 주세요", "저장된 작가와 제작 연도"),
    option("context", "르네상스 미술사적 의의를 알려 주세요", "르네상스 시대 배경"),
  ],
  "image:가나가와 해변의 높은 파도 아래 (The Great Wave off Kanagawa)": [
    option("composition", "거대한 파도와 후지산의 구도를 설명해 주세요", "파도와 후지산의 대비 구도"),
    option("color", "프러시안 블루의 활용과 판화 기법을 알려 주세요", "청색과 목판화 기법"),
    option("artist", "작가와 제작 연도를 알려 주세요", "저장된 작가와 제작 연도"),
    option("context", "우키요에와 에도 시대 배경이 궁금해요", "에도 시대 우키요에"),
  ],
  "youtube:Gallery Video": [
    option("metadata", "등록된 영상 정보를 정리해 주세요", "저장된 제목과 소개문"),
    option("limits", "이 영상에 대해 확인 가능한 정보는 무엇인가요?", "저장된 메타데이터의 범위"),
  ],
  "image:Nebula Dream": imageProfile("Nebula Dream", "깊은 우주의 보랏빛 성운"),
  "image:Stellar Drift": imageProfile("Stellar Drift", "어둠 속에서 길게 뻗은 별빛"),
  "image:Cosmic Dust": imageProfile("Cosmic Dust", "상상된 은하 가장자리의 빛나는 입자"),
  "image:Star Field": imageProfile("Star Field", "대기권 너머에서 바라본 지구와 우주 풍경"),
  "image:Deep Space Signal": imageProfile("Deep Space Signal", "어두운 지평선 위의 먼 신호"),
  "game:피카츄 배구 (Pikachu Volleyball)": gameProfile(
    "피카츄 배구",
    "2인용 배구 게임이라는 저장 정보",
  ),
  "game:TETR.IO": gameProfile(
    "TETR.IO",
    "온라인 테트리스 게임과 팝업 실행 방식",
  ),
  "game:전쟁시대 (Age of War)": gameProfile(
    "전쟁시대",
    "문명 발전과 기지 방어 방식",
  ),
  "game:이니셜 D (Initial D)": gameProfile(
    "이니셜 D",
    "일본 산길 배경의 카레이싱과 PS1 에뮬레이터",
  ),
  "game:테크로맨서 (Tech Romancer)": gameProfile(
    "테크로맨서",
    "거대 로봇 3D 대전과 에뮬레이터 실행 방식",
  ),
  "model:태양계": [
    option("planets", "여덟 행성의 구성을 설명해 주세요", "태양과 여덟 행성의 구성"),
    option("movement", "모델에서 행성은 어떻게 움직이나요?", "공전과 자전 표현"),
    option("earth", "지구 모델의 표현을 자세히 알려 주세요", "지구의 구름층과 야간 조명"),
  ],
  "model:우주왕복선": modelProfile("우주왕복선"),
  "model:NASA EVA 우주복": modelProfile("EVA 우주복"),
  "model:제미니 우주복": modelProfile("제미니 우주복"),
  "model:화성 탐사 로버": modelProfile("화성 탐사 로버"),
  "model:새턴 V 로켓": modelProfile("새턴 V 로켓"),
  "model:통신 위성": modelProfile("통신 위성"),
  "model:미확인 비행체 (UFO)": [
    option("definition", "UFO라는 용어의 의미를 알려 주세요", "정체가 확인되지 않은 비행 물체라는 정의"),
    option("history", "대중문화에서 주목받은 배경이 궁금해요", "1947년 로즈웰 사건 이후의 대중문화"),
    option("hypotheses", "저장된 여러 가설을 정리해 주세요", "설명되지 않은 현상과 여러 가설"),
  ],
  "model:블랙홀": [
    option("definition", "블랙홀은 무엇인가요?", "강한 중력과 빛"),
    option("formation", "블랙홀은 어떻게 만들어지나요?", "거대한 별의 붕괴"),
    option("visualization", "이 모델은 무엇을 시각화했나요?", "강착 원반과 상대론적 제트"),
  ],
  "model:아프로디테와 에로스 상 (Aphrodite holding Eros)":
    sculptureProfile("아프로디테와 에로스 상"),
  "model:메두사의 머리를 든 페르세우스 (Perseus with Medusa)":
    sculptureProfile("페르세우스 상"),
  "model:우골리노와 그의 아들들 (Ugolino and His Sons)":
    sculptureProfile("우골리노와 그의 아들들"),
  "model:승리의 여신 (Mourning Victory)":
    sculptureProfile("승리의 여신 상"),
  "model:키프로스 제사장 상 (Limestone Priest)":
    sculptureProfile("키프로스 제사장 상"),
};

export function getExhibitConversationProfile(exhibit) {
  return exhibitConversationProfiles[`${exhibit.type}:${exhibit.title}`] || null;
}

/* 역사/예술관 전시품 메타데이터. greekSculptureModels 배열에 id/제목/설명/작가 정의 */
import docentContexts from '../../../shared/docent-context.json';

function docentContext(slug) {
  const context = docentContexts[slug];
  return context ? JSON.stringify(context) : null;
}

export const greekSculptureModels = [
  {
    id: 'venus-de-milo',
    title: '아프로디테와 에로스 상 (Aphrodite holding Eros)',
    creator: '미상 (키프로스 조각가)',
    description: '기원전 4세기경 키프로스에서 제작된 석회암 조각상으로, 사랑의 여신 아프로디테가 날개 달린 에로스를 안고 있는 모습을 형상화했습니다. 키프로스의 아마토스에서 발굴되었으며, 헬레니즘 시대 키프로스 조각의 대표적인 예시로 손꼽힙니다.',
    type: 'model',
    period: '고전 후기 (기원전 4세기)',
    material: '석회암',
    location: '메트로폴리탄 미술관, 뉴욕',
    docentContext: docentContext('aphrodite-holding-eros'),
  },
  {
    id: 'winged-victory',
    title: '메두사의 머리를 든 페르세우스 (Perseus with Medusa)',
    creator: '안토니오 카노바 (Antonio Canova)',
    description: '1804~1806년 이탈리아 신고전주의 거장 안토니오 카노바가 제작한 대리석 걸작입니다. 영웅 페르세우스가 메두사를 처치한 후 그 머리를 높이 들어 올린 승리의 순간을 포착했습니다. 고전 그리스 조각의 이상미를 재해석한 신고전주의의 정수로 평가받습니다.',
    type: 'model',
    period: '신고전주의 (1806년)',
    material: '대리석',
    location: '메트로폴리탄 미술관, 뉴욕',
    docentContext: docentContext('canova-perseus-medusa'),
  },
  {
    id: 'laocoon',
    title: '우골리노와 그의 아들들 (Ugolino and His Sons)',
    creator: '장바티스트 카르포 (Jean-Baptiste Carpeaux)',
    description: '1865~1867년 프랑스 조각가 장바티스트 카르포가 제작한 대리석 군상입니다. 단테의 신곡에 등장하는 우골리노 백작이 굶주림 속에서 아들들과 함께 투옥된 비극적 순간을 극적으로 표현했습니다. 격렬한 감정과 역동적 구성이 인상적인 사실주의 걸작입니다.',
    type: 'model',
    period: '낭만주의 (1867년)',
    material: '생베아 대리석',
    location: '메트로폴리탄 미술관, 뉴욕',
    docentContext: docentContext('carpeaux-ugolino-and-sons'),
  },
  {
    id: 'discobolus',
    title: '승리의 여신 (Mourning Victory)',
    creator: '대니얼 체스터 프렌치 (Daniel Chester French)',
    description: '1908년 미국 조각가 대니얼 체스터 프렌치가 제작한 대리석 조각상입니다. 날개를 펼친 승리의 여신이 머리를 숙이고 왼손에는 월계관을, 오른손에는 종려나무 가지를 들고 있습니다. 1차 세계대전 전몰자를 추모하는 기념비의 일부로, 고요한 슬픔과 승리의 엄숙함을 동시에 담아낸 작품입니다.',
    type: 'model',
    period: '1908년',
    material: '대리석',
    location: '메트로폴리탄 미술관, 뉴욕',
    docentContext: docentContext('mourning-victory'),
  },
  {
    id: 'thinker',
    title: '키프로스 제사장 상 (Limestone Priest)',
    creator: '미상 (키프로스 조각가)',
    description: '기원전 6세기 말엽 키프로스에서 제작된 거대한 석회암 조각상으로, 긴 의복을 입고 정면을 응시하는 제사장의 모습을 표현했습니다. 아르카이크 시대 키프로스 조각의 전형적인 양식을 보여주며, 당시 종교적 권위의 위엄을 느끼게 합니다.',
    type: 'model',
    period: '아르카이크 시대 (기원전 6세기)',
    material: '석회암',
    location: '메트로폴리탄 미술관, 뉴욕',
    docentContext: docentContext('cypriot-limestone-priest'),
  },
];

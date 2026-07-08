# 작업 이력 로그

이 문서는 누가 무엇을 왜 바꿨는지 추적하는 작업 로그다.  
작업이 끝날 때마다 최신 항목을 위에 추가한다.

## 로그 작성 규칙

| 규칙 | 설명 |
| --- | --- |
| 최신순 | 새 로그는 가장 위에 추가한다. |
| 사실 중심 | 실제로 한 일과 확인한 일을 분리해서 쓴다. |
| 검증 명시 | 테스트/빌드/수동 확인을 명확히 적는다. |
| 미검증 기록 | 못 해본 것은 못 했다고 적는다. |
| 다음 작업 연결 | 다음 사람이 바로 시작할 수 있는 행동을 적는다. |

## 작업 로그

### 2026-07-08 - 아케이드 게임기 화면에 게임 썸네일 표시

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-CABINET-THUMBNAIL-001 |
| 범위 | 레트로 아케이드 캐비닛 CRT 화면 텍스처 |
| 목적 | 각 게임기의 화면에 해당 게임의 Supabase 썸네일 표시 |
| 변경 파일 | [frontend/src/three/createRetroCabinet.js](../frontend/src/three/createRetroCabinet.js) |
| 결정 | `thumbnailUrl` 이미지를 CanvasTexture에 비율 유지로 합성하고 비네트·스캔라인을 적용, 로딩 실패 시 기존 INSERT COIN 화면 유지 |
| 검증 | `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 실제 브라우저에서 외부 이미지 CORS와 작은 CRT 화면 가독성 수동 확인 필요 |
| 다음 작업 | 다섯 게임기 화면의 이미지 로딩·비율·밝기 확인 |

---

### 2026-07-08 - 레트로 포스터 기존 네온 팔레트 복원

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-POSTER-COLOR-002 |
| 범위 | 레트로 포스터 네온 색상 |
| 목적 | 게임기 색과 무관하게 이미지 적용 전 포스터 고유 색감 유지 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js) |
| 결정 | 분홍·청록, 초록·파랑, 보라·민트, 주황·분홍, 노랑·분홍의 기존 포스터별 네온 테두리 팔레트 복원 |
| 검증 | `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 실제 장면 색감 수동 확인 필요 |
| 다음 작업 | 다섯 포스터의 네온 색상이 기존 분위기와 일치하는지 확인 |

---

### 2026-07-08 - 레트로 포스터 테마색과 사이드바 미리보기 연결

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-POSTER-PREVIEW-001 |
| 범위 | 레트로 포스터 색상, 게임 메타데이터, 전시 정보 패널 |
| 목적 | 각 포스터를 연결 게임의 캐비닛 색상과 맞추고 사이드바에 동일 이미지 표시 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js), [frontend/src/three/retroGameDescriptions.js](../frontend/src/three/retroGameDescriptions.js), [frontend/src/components/ExhibitInfoPanel.jsx](../frontend/src/components/ExhibitInfoPanel.jsx) |
| 결정 | 게임별 테마색을 네온 프레임에 적용하고 Supabase URL을 `thumbnailUrl`로 재사용, 작품 전환 시 이미지 오류 상태 초기화 |
| 검증 | `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 실제 브라우저에서 Supabase 이미지 로딩과 색상 밝기 수동 확인 필요 |
| 다음 작업 | 다섯 포스터 접근 시 사이드바 미리보기와 프레임 색상 확인 |

---

### 2026-07-08 - 레트로 포스터 비율·크기·네온 프레임 개선

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-POSTER-FRAME-001 |
| 범위 | 레트로게임관 포스터 프레임 렌더링 |
| 목적 | 기존 네온 분위기를 유지하면서 이미지 왜곡을 없애고 포스터 가시성을 높임 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js) |
| 결정 | 기준 크기를 1.35배로 확대하고 이미지 원본 비율에 맞춰 프레임 geometry와 네온 테두리를 함께 재조정 |
| 검증 | `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 실제 장면에서 가로형 이미지 액자 높이와 인접 오브젝트 간격 수동 확인 필요 |
| 다음 작업 | 다섯 포스터의 크기·밝기·벽 간격을 실제 화면에서 확인 |

---

### 2026-07-08 - 레트로 포스터 게임 이미지 연결

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-POSTER-IMAGE-001 |
| 범위 | 레트로게임관 포스터 텍스처 |
| 목적 | Supabase 게임 이미지를 각 게임 설명과 일치하는 포스터에 표시 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js) |
| 결정 | 현재 거리 기반 1:1 배정과 일치하도록 Initial D, Kikaioh/Tech Romancer, Age of War, Pikachu Volleyball, Tetris 이미지를 각 벽 위치에 연결하고 원본 비율로 액자 내부에 맞춤 |
| 검증 | 거리별 매칭 확인, `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 외부 이미지 CORS·가용성과 실제 액자 내 표시 크기 수동 확인 필요 |
| 다음 작업 | 레트로게임관에서 다섯 이미지의 로딩과 설명 일치 여부 확인 |

---

### 2026-07-08 - 레트로 포스터에 가까운 게임 설명 연결

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-POSTER-DOCENT-001 |
| 범위 | 레트로게임관 포스터 근접 감지와 게임 메타데이터 연결 |
| 목적 | 각 포스터 앞에서 거리 기준으로 서로 다른 게임기 하나의 설명문 표시 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js), [frontend/src/three/retroGalleryRuntime.js](../frontend/src/three/retroGalleryRuntime.js) |
| 결정 | 포스터와 게임기 사이 전체 거리 합이 최소가 되는 1:1 조합을 계산해 게임 메타데이터를 중복 없이 자동 연결 |
| 검증 | `node --check` 성공, `npm run build` 성공 |
| 남은 위험 | 실제 장면에서 포스터 접근 시 설명 전환 거리와 시야각 수동 확인 필요 |
| 다음 작업 | 각 포스터 앞에서 연결된 게임 제목·설명이 의도한 대상과 일치하는지 확인 |

---

### 2026-07-08 - 레트로게임관 빈 벽 액자 추가

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-WALL-ART-001 |
| 범위 | 레트로게임관 벽 장식 |
| 목적 | 아무 장식이 없던 앞쪽 벽 중앙을 기존 네온 포스터 스타일로 채움 |
| 변경 파일 | [frontend/src/three/createRetroWallArt.js](../frontend/src/three/createRetroWallArt.js) |
| 결정 | 기존 CanvasTexture 포스터 배열에 `HIGH SCORE / HALL OF FAME` 액자를 추가해 스타일과 정리 흐름을 재사용 |
| 검증 | `npm run build` 성공 |
| 남은 위험 | 실제 장면에서 시야 높이와 밝기 수동 확인 필요 |
| 다음 작업 | 레트로게임관 앞쪽 벽에서 액자 방향과 중앙 정렬 확인 |

---

### 2026-07-08 - 레트로게임관 장식과 네온 바닥 추가

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | RETRO-DECOR-001 |
| 범위 | 레트로게임관 전용 Three.js 런타임 장식 |
| 목적 | 중앙 게임기 외의 외곽·후면·바닥 공간을 채워 전시관이 비어 보이는 문제 완화 |
| 변경 파일 | [frontend/src/three/createRetroDecor.js](../frontend/src/three/createRetroDecor.js), [frontend/src/three/retroGalleryRuntime.js](../frontend/src/three/retroGalleryRuntime.js) |
| 결정 | 외부 모델 없이 절차적 도형과 CanvasTexture로 네온 바닥, ARCADE 간판, 스피커, 코인 교환기, 자판기를 만들고 레트로관 동적 런타임에만 포함 |
| 검증 | `node --check` 2개 파일 성공, `npm run build` 성공 |
| 남은 위험 | 인앱 브라우저가 제공되지 않아 실제 장면의 밝기·시야·동선은 수동 확인 필요 |
| 다음 작업 | 레트로게임관에 진입해 중앙 게임기 조작 동선, 포탈 가림 여부, 네온 밝기를 확인하고 좌표·강도를 미세 조정 |

#### 수행 체크리스트

- [x] 중앙 게임기 주변 네온 링 추가
- [x] 외곽 바닥 네온 라인과 타일 추가
- [x] 후면 ARCADE 간판과 스피커 추가
- [x] 측면 코인 교환기와 자판기 추가
- [x] 프론트엔드 빌드 검증
- [ ] 실제 브라우저 장면 수동 확인

---

### 2026-07-06 - 작품 편집 DB 대상 표시 추가

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | ADMIN-DB-VISIBILITY-001 |
| 범위 | 프론트엔드 작품 편집 UI와 백엔드 상태 조회 API 연동 |
| 목적 | 작품 추가/수정/삭제가 H2 임시 DB에 저장되는지 Oracle 공용 DB에 저장되는지 관리자 화면에서 즉시 확인할 수 있게 함 |
| 변경 파일 | [frontend/src/api/exhibitApi.js](../frontend/src/api/exhibitApi.js), [frontend/src/pages/GalleryPage.jsx](../frontend/src/pages/GalleryPage.jsx), [frontend/src/components/ExhibitEditorPanel.jsx](../frontend/src/components/ExhibitEditorPanel.jsx), [frontend/src/styles.css](../frontend/src/styles.css) |
| 결정 | 저장 로직은 이미 백엔드 DB를 타고 있으므로 바꾸지 않고, `/api/health`를 읽어 DB 종류를 표시하고 H2 저장 시 확인창을 띄우도록 함 |
| 검증 | `npm.cmd run build` 성공 |
| 남은 위험 | Oracle 실행 상태에서 실제 수정 저장까지는 현재 환경에서 수동 검증 필요 |
| 다음 작업 | 메인홀을 팀 공용 DB에 반영할 때는 백엔드를 Oracle 기본 프로필로 실행하고 관리자 패널에서 `Oracle 공용 DB` 표시를 확인 |

#### 수행 체크리스트

- [x] 백엔드 상태 조회 API를 프론트에서 호출
- [x] 관리자 패널에 DB 대상 표시 추가
- [x] H2 임시 DB 저장 전 확인창 추가
- [x] 프론트엔드 빌드 검증
- [ ] Oracle 실행 상태에서 실제 작품 수정 수동 확인

---

### 2026-07-06 - 중앙 통제실 문서 체계 생성

| 항목 | 내용 |
| --- | --- |
| 작업자 | Codex |
| 작업 ID | MC-INIT-001 |
| 범위 | `mission_control` 폴더와 운영 문서 템플릿 생성 |
| 목적 | AI 작업자 교체 시 컨텍스트 유지, 범위 이탈 방지, 이력 추적을 위한 문서 체계 구축 |
| 변경 파일 | [README.md](./README.md), [00_AI_WORKER_RULES.md](./00_AI_WORKER_RULES.md), [01_STATUS_BOARD.md](./01_STATUS_BOARD.md), [02_PROJECT_CHARTER.md](./02_PROJECT_CHARTER.md), [03_SYSTEM_MAP.md](./03_SYSTEM_MAP.md), [04_DECISION_RECORDS.md](./04_DECISION_RECORDS.md), [05_WORK_LOG.md](./05_WORK_LOG.md), [06_HANDOFF.md](./06_HANDOFF.md), [07_TASK_CARD_TEMPLATE.md](./07_TASK_CARD_TEMPLATE.md), [08_VERIFICATION_CHECKLIST.md](./08_VERIFICATION_CHECKLIST.md) |
| 결정 | 범용성을 위해 프로젝트 고유 정보가 불확실한 영역은 `작성 필요` 템플릿으로 남김 |
| 검증 | `mission_control` 폴더 파일 목록 확인, 미완료 상태 문구 검색 |
| 남은 위험 | 실제 팀 운영 규칙, 우선순위, 금지 원칙은 팀 확인 후 채워야 함 |
| 다음 작업 | `01_STATUS_BOARD.md`와 `02_PROJECT_CHARTER.md`에 현재 프로젝트 고유 정보를 채우기 |

#### 수행 체크리스트

- [x] 중앙 통제실 폴더 구조 설계
- [x] AI 작업자 시작/종료 규칙 문서화
- [x] 상태판, 헌장, 시스템 지도, ADR, 작업 로그, 인수인계 템플릿 생성
- [ ] 팀 고유 목표와 운영 제약 입력
- [ ] 실제 검증 명령 확정

---

## 새 로그 템플릿

### YYYY-MM-DD - 작업 제목

| 항목 | 내용 |
| --- | --- |
| 작업자 | 작성 필요 |
| 작업 ID | 작성 필요 |
| 범위 | 작성 필요 |
| 목적 | 작성 필요 |
| 변경 파일 | 작성 필요 |
| 결정 | 작성 필요 |
| 검증 | 작성 필요 |
| 남은 위험 | 작성 필요 |
| 다음 작업 | 작성 필요 |

#### 수행 체크리스트

- [ ] 작성 필요

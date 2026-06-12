# 작업 인수인계

이 문서는 작업이 중간에 중단되거나 작업자가 교체될 때 사용한다. 다음 작업자는 이 문서를 먼저 읽고 현재 상태를 파악한다.

## 현재 진행 중인 작업

| 항목          | 내용                                                             |
| ------------- | ---------------------------------------------------------------- |
| 2026-06-12    | 레트로 게임관 플레이 버튼 복구 및 빌드 경고 기록 (TASK-036)      |
| 2026-06-12    | 3D 전시물 물리 충돌(TASK-034) 및 달리기(TASK-035) 완료           |
| 2026-06-12    | 기술 부채 추적 시작 (TASK-032)                                   |
| 2026-06-10    | 세션 단위 대화형 큐레이터 (TASK-023)                             |
| 작업명        | 대화형 큐레이터 및 물리/이동성 개선                              |
| 상태          | DOING                                                            |
| 현재 담당자   | Gemini CLI                                                       |
| 마지막 갱신일 | 2026-06-12                                                       |

## 완료된 부분

- [x] 레트로 게임관 5종 플레이 버튼 및 게임 전용 대화 선택지 복구 (TASK-036)
- [x] 3D 주요 전시물 플레이어 통과 방지 물리 충돌 판정 구현 (TASK-034)
- [x] Shift 키를 이용한 달리기(기본 3.2 -> 달리기 4.8) 기능 구현 (TASK-035)
- [x] 레트로 게임관 5종 3D 아케이드 캐비닛 모델 추가 및 배치 (TASK-030)
- [x] 기술 부채 추적 시작 및 `TECHNICAL_DEBT.md` 생성 (TASK-032)
- [x] `ai_command/AI_WORKFLOW.md` 생성
- [x] `ai_command/PROJECT_VISION.md` 생성
- [x] `ai_command/ARCHITECTURE.md` 생성
- [x] `ai_command/DECISIONS.md` 생성
- [x] `ai_command/TASK_BOARD.md` 생성
- [x] `ai_command/WORK_LOG.md` 생성
- [x] `ai_command/HANDOVER.md` 생성
- [x] 이번 문서 생성 작업을 `WORK_LOG.md`에 기록
- [x] `TASK_BOARD.md`에서 `TASK-001`을 `DONE`으로 기록
- [x] `AI_WORKFLOW.md` 최상단에 작업 시작 규칙 추가
- [x] `.gitignore`에 `ai_command/` 추가
- [x] `main` 브랜치 worktree에 `ai_command/` 문서와 `.gitignore` 변경 반영
- [x] 운영 문서 폴더명을 `studio`에서 `ai_command`로 변경
- [x] 문서 내부 경로 참조를 `ai_command/` 기준으로 변경
- [x] `git pull` 이후 외부 변경 확인 규칙 추가
- [x] 프론트엔드 UI 수정 (GalleryPage, styles.css)
- [x] 전시실/작품 구조에 portal·map 필드 추가
- [x] AI 서버 연동 개선 및 설정 변경 (ai_service, AiController, WebClientConfig 등)
- [x] 프론트엔드 컴포넌트 및 3D 장면 개선 (ExhibitInfoPanel, RoomHUD, GalleryScene 등)
- [x] DB 스키마 및 시드 데이터 수정 (db.sql, migration SQL, DataInitializer)
- [x] AI 서버 .env 생성
- [x] `WORK_LOG.md`에 2026-06-01 작업 이력 7건 기록
- [x] 별이 빛나는 밤 키워드·예시 설명문을 공유 갤러리 시드로 이동
- [x] 프론트 -> Spring -> FastAPI -> Gemini 키워드·예시 전달 경로 구현
- [x] Gemini 다중 키 라운드로빈, quota 쿨다운, 제한된 키 전환 구현
- [x] AI 프롬프트·엔드포인트·다중 키·Spring 보강 로직 테스트 추가
- [x] GalleryPage — 질문 실패 시 `requestedExhibitIdRef` 초기화 (TASK-019 Phase 1)
- [x] GalleryScene — 공간관/역사관 일반 exhibits 렌더링 skip 조건 제거 (TASK-019 Phase 1)
- [x] GalleryScene.jsx 846→477줄, 6개 함수 파일로 분할 (TASK-019 Phase 2)
- [x] 중복 근접 감지 통합 (3회→2회 호출) (TASK-019 Phase 2)
- [x] ExhibitInfoPanel 이미지 로딩 실패 시 onError 숨김 처리 (TASK-019 Phase 2)
- [x] GalleryVoiceChat `<audio autoPlay>` 제거 (TASK-019 Phase 2)
- [x] 7개 파일 한국어 주석 추가 (TASK-019)
- [x] 프론트엔드 전면 한국어 주석 추가 — 40개 `.js`/`.jsx`/`.css` 파일 (TASK-019 연장)
- [x] 프론트엔드 AI 도슨트 요청 UX 개선: `AbortController` 기반 이전 요청 취소, fallback 경합 제거, `DocentSpeechBubble` 로딩 상태 표시 강화
- [x] 동일 요청 캐시 제거: 매 요청마다 미묘하게 다른 설명 생성 요구 유지 (TASK-021)
- [x] `useGalleryMovement` 입력 이벤트를 렌더러 DOM 생성 후 연결하도록 보완 (TASK-021)
- [x] 우주관·역사관 런타임 동적 import 및 React·Three 코어 청크 분리 (TASK-022)
- [x] 세션 대화 기록 기반, 카테고리별 추천 질문, 저장 설명문 우선 표시 구현 (TASK-023 Phase 1)
- [x] 근거 기반 선택지 필터, 기록 자동 스크롤, 요청 중단·실패 재시도 구현 (TASK-023 UX 보강)
- [x] 포털 제외 현재 전시물 30개에 전시물별 추천 선택지 프로필 연결 (TASK-023 데이터 보강)
- [x] WebLLM pull 충돌 해소 및 원래 하이브리드 요청 라우팅 복원 (TASK-023 통합)
- [x] 프론트엔드 빌드 검증: `npm run build` 성공

## 남은 작업

| 우선순위 | 작업 ID  | 작업                                              | 메모                                               |
| -------- | -------- | ------------------------------------------------- | -------------------------------------------------- |
| 높음     | TASK-023 | 세션 단위 대화형 큐레이터 구현                    | WebLLM 모델 다운로드·연속 대화 브라우저 검증 필요  |
| 중간     | TASK-024 | WebLLM 체감 속도 개선 및 JSON 기반 전시 안내 확장 | 구현 전 계획만 확정됨                              |
| 중간     | TASK-026 | 우주관/역사관 첫 진입 시 로딩 UX 검토             | 동적 import 로딩 중 빈 화면 발생 가능 (현재 DOING) |
| 중간     | TASK-027 | 프론트엔드 이동·입력·요청 경합 수동 검증          | WASD/포인터 잠금/작품 전환/방 이동 시 경합 확인    |
| 낮음     | TASK-028 | TETR.IO 팝업 차단 경고 UX 개선                    | 팝업 차단 시 사용자 안내 필요                      |
| 낮음     | TASK-029 | 3D 리소스 관리 및 렌더링 성능 최적화              | Asset Loader, InstancedMesh 등                     |
| 낮음     | TASK-031 | Gemini 다중 키 정책 문서화                        | 구현 완료, 정책 문서만 필요                        |
| 낮음     | TASK-032 | 기술 부채 추적 시작                               | TECHNICAL_DEBT.md 생성, 검토 필요 (현재 REVIEW)    |
| 낮음     | TASK-033 | 문서-코드 일관성 검증 자동화 계획                 | Java/Spring 버전 불일치 방지                       |
| 낮음     | TASK-002 | 백엔드 API 엔드포인트 목록 정리                   | 컨트롤러와 DTO 직접 확인 필요                      |
| 낮음     | TASK-003 | 프론트엔드 UX 검수 기준 구체화                    | 로컬 실행 후 실제 화면 기준으로 보강               |
| 낮음     | TASK-004 | AI 서버 외부 의존성 명세 정리                     | 민감 정보 제외, 환경 변수명과 역할만 기록          |
| 낮음     | TASK-011 | AI 생성 품질 검토                                 | 근거 없는 표현 및 문장 수 위반 방지 필요           |

### 2026-06-10 추가 작업: 프론트 개선 선별 유지 및 AI 요청 경합 제거

| 항목             | 내용                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID          | TASK-021                                                                                                                                                                                                     |
| 상태             | DONE                                                                                                                                                                                                         |
| 완료             | 동일 요청 캐시 제거, `AbortController` 요청 취소 유지, 새 작품·질문·방 이동 시 fallback 및 이전 요청 정리, 이동 훅의 렌더러 DOM 연결 시점 보완, 생성 중 표시 유지                                            |
| 먼저 확인할 파일 | `frontend/src/pages/GalleryPage.jsx`, `frontend/src/api/aiApi.js`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/hooks/useGalleryMovement.js`, `frontend/src/components/DocentSpeechBubble.jsx` |
| 주의 사항        | 동일 작품·질문의 생성 결과를 캐시하면 요청마다 설명이 달라야 한다는 요구와 충돌한다. 이동 훅에 `rendererRef.current?.domElement`를 렌더 중 직접 전달하면 최초 입력 이벤트가 연결되지 않을 수 있다.           |
| 검증 결과        | `npm run build` 성공, `git diff --check` 성공. 로컬 브라우저 연결 불가로 실제 이동 입력 수동 검증은 미수행.                                                                                                  |

### 2026-06-10 추가 작업: 프론트엔드 번들 분리

| 항목             | 내용                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-022                                                                                                                                                   |
| 상태             | DONE                                                                                                                                                       |
| 완료             | 우주관·역사관 모델 생성기를 런타임 모듈로 분리하고 전시관 진입 시 동적으로 로드한다. React와 Three 코어를 별도 청크로 분리했다.                            |
| 먼저 확인할 파일 | `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/spaceGalleryRuntime.js`, `frontend/src/three/greekGalleryRuntime.js`, `frontend/vite.config.js` |
| 주의 사항        | 특수 전시관은 런타임 모듈이 준비된 뒤 장면을 생성한다. 동적 import를 다시 정적 import로 바꾸면 초기 번들 크기와 경고가 되돌아온다.                         |
| 검증 결과        | `npm run build` 성공, 번들 경고 없음. 앱 청크 119KB, Three 코어 561KB, React 192KB.                                                                        |

### 2026-06-10 계획: 세션 단위 대화형 큐레이터

| 항목             | 내용                                                                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-023                                                                                                                                                                                                                                                                                     |
| 상태             | DOING, Phase 1 구현 완료                                                                                                                                                                                                                                                                     |
| 목표             | 저장된 기본 설명 이후 카테고리별 추천 선택지와 자유 텍스트·음성 입력으로 큐레이터 대화를 시작하고, 세션 전체 기록을 유지한다.                                                                                                                                                                |
| AI 분담          | 추천 선택지 최초 설명은 외부 API, 후속 대화는 WebLLM. 앱 조작은 프론트 허용 목록 검사 후 실행한다.                                                                                                                                                                                           |
| 히스토리         | 사용자 입력과 모든 AI 응답을 단일 탭 세션에 시간순 저장한다. 작품·전시관 이동 후에도 대화창·기록·대화 연속성을 유지한다.                                                                                                                                                                     |
| 먼저 확인할 파일 | `frontend/src/App.jsx`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/components/VoiceDocentControl.jsx`, `frontend/src/components/DocentSpeechBubble.jsx`, `frontend/src/api/aiApi.js`, `ai-server/app/core/prompt_templates.py`                                                      |
| 완료             | 작품 접근은 저장 설명문만 표시한다. 추천 선택지 최초 요청은 외부 API, 텍스트·음성·후속 재시도는 WebLLM으로 라우팅한다. 외부 API 한도 시 WebLLM fallback을 사용하며, WebLLM에는 현재 전시물 근거와 최근 세션 메시지 최대 12개를 전달한다. 외부 API와 WebLLM 응답 출처를 세션 기록에 구분한다. |
| 남은 작업        | 실제 브라우저에서 WebLLM 모델 최초 다운로드·연속 대화 성공 여부 확인, 약 6MB WebLLM 동적 청크 경고 검토                                                                                                                                                                                      |
| 주의 사항        | 새 전시물은 데이터에 `curatorOptions`를 넣거나 `exhibitConversationProfiles.js`에 `type:title` 프로필을 추가한다. WebLLM 생성 자체는 AbortSignal로 즉시 중단되지 않으므로 요청 순번 검사로 늦은 응답 반영을 차단한다. 모델 로딩 실패 시 캐시된 Promise를 초기화해 재시도한다.                |
| 검증 결과        | 프론트 `npm run build` 성공, 백엔드 23개 테스트 성공, AI 서버 9개 테스트 성공, `git diff --check` 성공. Git `UU` 충돌 경로 없음.                                                                                                                                                             |

## 다음 작업자가 먼저 확인할 파일

| 순서 | 파일                         | 확인 목적                           |
| ---- | ---------------------------- | ----------------------------------- |
| 1    | `ai_command/AI_WORKFLOW.md`  | 작업 시작/종료 규칙 확인            |
| 2    | `ai_command/TASK_BOARD.md`   | 현재 할당 가능한 작업 확인          |
| 3    | `ai_command/ARCHITECTURE.md` | 현재 파악된 구조와 미확인 항목 확인 |
| 4    | `README.md`                  | 실행 방법 확인                      |
| 5    | `docs/architecture.md`       | 기존 아키텍처 요약 확인             |

## 주의 사항

- [ ] 특정 AI 모델에 고정 역할, 권한, 책임을 부여하지 않는다.
- [ ] 작업 범위를 벗어난 소스 코드는 수정하지 않는다.
- [ ] 미확인 정보는 추측하지 말고 "미확인"으로 기록한다.
- [ ] 설계 변경이 발생하면 `DECISIONS.md`에 기록한다.
- [ ] 작업 종료 시 `WORK_LOG.md`, `HANDOVER.md`, `TASK_BOARD.md`를 함께 갱신한다.
- [ ] `git pull`, 브랜치 전환, 머지, 리베이스 이후에는 팀원 변경사항을 확인하고 필요 시 외부 변경 요약을 남긴다.

## 알려진 문제

| 문제                               | 상태 | 메모                                                                              |
| ---------------------------------- | ---- | --------------------------------------------------------------------------------- |
| 제품 상세 요구사항 미확인          | 열림 | `PROJECT_VISION.md`에 템플릿으로 남김                                             |
| 백엔드 API 상세 목록 미정리        | 열림 | `TASK-002`로 등록                                                                 |
| AI 서버 외부 AI 제공자 상세 미확인 | 열림 | `TASK-004`로 등록                                                                 |
| 배포 환경 미확인                   | 열림 | 운영 인프라 정보 필요                                                             |
| Gemini 응답의 근거 없는 표현       | 열림 | `달빛`, `내면세계`, `열정과 고뇌` 등 제공 정보에 없는 표현이 실제 검사에서 생성됨 |
| 공유 Oracle DB 연결 타임아웃       | 열림 | `10.1.82.127:1521/XE` 읽기 전용 조회가 2026-06-09 타임아웃됨                      |
| WebLLM 동적 청크 크기 경고          | 열림 | 약 6,023KB로 Vite 650KB 경고 한도 초과. 초기 앱과 분리되어 있으나 최초 사용 UX 검토 필요 |

---

### 2026-06-09 추가 작업: AI 도슨트 데이터 경로 및 다중 키

**작업자:** codex

| 항목             | 내용                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID          | TASK-017                                                                                                                                                                                                                                                                                                                 |
| 상태             | DONE                                                                                                                                                                                                                                                                                                                     |
| 완료             | 공유 시드 버전 3에 별이 빛나는 밤 키워드·예시문 추가, 백엔드 저장·API 응답, 프론트 AI 요청, FastAPI 프롬프트 연결, 다중 Gemini 키 순환 및 테스트                                                                                                                                                                         |
| 다음 작업        | 생성 후 근거 없는 표현 검사 및 fallback 정책 결정, 공유 Oracle DB 접근 가능 환경에서 스키마·시드 확인                                                                                                                                                                                                                    |
| 먼저 확인할 파일 | `shared/gallery-seed.json`, `frontend/src/api/aiApi.js`, `backend/src/main/java/com/example/aiexhibition/global/config/DataInitializer.java`, `backend/src/main/java/com/example/aiexhibition/exhibit/dto/ExhibitResponse.java`, `ai-server/app/clients/external_ai_client.py`, `ai-server/app/core/prompt_templates.py` |
| 주의 사항        | API 키 원문은 문서나 추적 파일에 기록하지 않는다. `ai-server/.env`는 Git 제외 대상이다. 공유 시드 변경 시 `version`을 증가시킨다.                                                                                                                                                                                        |
| 검증 결과        | 프론트 빌드, Spring 테스트, FastAPI 테스트 6개, local H2 작품 API, 전체 AI 요청 경로 검증 완료                                                                                                                                                                                                                           |

### 2026-06-12: 레트로 게임관 3D 아케이드 캐비닛 모델 추가

**작업자:** opencode

| 항목             | 내용                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-030                                                                                                                                                                                                                                                                                                                                                                                                        |
| 상태             | DONE                                                                                                                                                                                                                                                                                                                                                                                                            |
| 완료             | `createRetroCabinet.js` — 5종 게임별 3D 아케이드 캐비닛 절차적 생성 (네온 테두리,마퀴,스크린 glow,조이스틱,버튼). `retroGameDescriptions.js` — type:'model' + contentUrl + 캐비닛 위치 데이터 추가. `retroGalleryRuntime.js` 생성 — 기존 space/greek 런타임 패턴과 동일. `GalleryScene.jsx` — hall 4 동적 import + 런타임 통합. `GalleryPage.jsx` — retroGameModels import + handleExhibitFocus 검색 경로 추가. |
| 먼저 확인할 파일 | `frontend/src/three/createRetroCabinet.js`, `frontend/src/three/retroGalleryRuntime.js`, `frontend/src/three/retroGameDescriptions.js`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/pages/GalleryPage.jsx`                                                                                                                                                                                             |
| 주의 사항        | 3D 캐비닛은 절차적 지오메트리로 생성되어 외부 GLB 파일 의존성이 없음. 게임 실행은 기존 `ExhibitInfoPanel`의 `handleGameLaunch` 경로 유지 (`contentUrl` + `popup` 필드).                                                                                                                                                                                                                                         |
| 검증 결과        | `npm run build` 성공 (1649→1651 modules). retroGalleryRuntime 4.86KB 동적 청크 분리 완료. 번들 경고 없음.                                                                                                                                                                                                                                                                                                       |

### 2026-06-12: 레트로 게임관 플레이 버튼 복구

**작업자:** codex

| 항목             | 내용                                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-036                                                                                                                                                                                                                                           |
| 상태             | DONE                                                                                                                                                                                                                                               |
| 완료             | `retroGameDescriptions.js`의 레트로 게임 5종 타입을 `model`에서 `game`으로 복구하여 `ExhibitInfoPanel`의 게임 뱃지, 플레이 버튼, 게임 전용 큐레이터 선택지가 다시 표시되도록 했다.                                                                |
| 먼저 확인할 파일 | `frontend/src/three/retroGameDescriptions.js`, `frontend/src/components/ExhibitInfoPanel.jsx`, `frontend/src/three/retroGalleryRuntime.js`                                                                                                       |
| 주의 사항        | 3D 캐비닛 렌더링은 데이터의 `type`이 아니라 `retroGalleryRuntime.js`의 별도 생성 경로가 담당한다. 게임 데이터 타입을 다시 `model`로 변경하면 플레이 버튼과 `game:*` 대화 프로필이 사라진다.                                                        |
| 경고             | `frontend/src/styles.css`의 여분 `}`는 제거하여 CSS 문법 경고를 해결했다. WebLLM 동적 청크 약 6,023KB는 이미 질문 시점에만 지연 로드되며, 전역 경고 한도를 올리면 다른 번들 회귀를 숨길 수 있어 경고를 유지한다. 자세한 내용은 `TECHNICAL_DEBT.md`를 확인한다. |
| 검증 결과        | `npm run build` 성공, `git diff --check` 성공, 게임 5종의 `type: "game"` 및 `contentUrl` 확인. 실제 브라우저 클릭 검증은 미수행.                                                                                                                  |

### 2026-06-12: origin/main 병합 완료

| 항목                | 내용                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| 명령                | `git pull origin main`                                                                                  |
| 병합 전략           | ort (auto-merge)                                                                                        |
| 병합 파일           | 12개 (신규 4개, 수정 8개)                                                                               |
| 충돌                | 없음 (자동 병합 성공)                                                                                   |
| origin/main 변경    | WebSocket 재연결 로직, sendVoiceReady→sendVoiceState, WebRTC ICE 서버 설정, VOICE_NOT_READY 지원        |
| 우리 변경 유지 확인 | retroGameModels import, createRetroCabinet.js, retroGalleryRuntime.js, GalleryScene/Page 수정 모두 유지 |
| 빌드 검증           | `npm run build` 성공 (1651 modules)                                                                     |

---

## 통합 시 확인 사항

- [ ] 프론트엔드 `npm run build` 성공 여부
- [ ] 백엔드 `mvn test` 또는 `mvn spring-boot:run` 성공 여부
- [ ] AI 서버 `/health` 응답 여부
- [ ] 프론트엔드에서 작품 정보 로딩 여부
- [ ] AI 도슨트 요청 흐름 정상 동작 여부
- [ ] 모바일과 데스크톱에서 UI 겹침 여부

## 추가 메모

이번 작업(2026-06-01)은 운영 문서 생성, 운영 규칙 보강, 운영 문서 폴더명 변경에 한정했다. 애플리케이션 소스는 수정하지 않았다. `ARCHITECTURE.md`는 확인 가능한 파일 구조와 기존 문서만 반영했으며, 상세 API 계약과 제품 요구사항은 다음 작업에서 보강해야 한다. 현재 브랜치는 `test`이며, `main` 브랜치용 worktree `..\VR-main-worktree`에도 동일한 `ai_command/` 문서와 `.gitignore` 변경을 작성했다.

---

### 2026-06-01 추가 작업

이번 세션에서는 `soldesk` 계정으로 로컬 PC에서 백엔드/프론트엔드/AI 서버 소스 코드를 직접 수정했다. 또한 `dh`(kshe1242)의 PR #3~#5를 `origin/main`에서 머지했다. 상세 작업 이력은 `WORK_LOG.md`의 2026-06-01 항목 7건을 참고한다.

**모든 파일이 커밋 완료**된 상태이다. (`d4829ff` 우주관, `e00e5ad` 역사관, `88e67f0` 레트로 게임관)

---

### 2026-06-02: 우주관 3D 모델 전시 구현 + AI API 장애 진단

**작업자:** codex (3D 모델 구현), opencode (장애 진단 + 문서 갱신)

#### 완료된 부분

| 작업                  | 담당     | 설명                                                                              |
| --------------------- | -------- | --------------------------------------------------------------------------------- |
| 태양계 3D 모델        | codex    | `createSolarSystem.js` — 8개 행성 공전, 별자리, 태양광원, 14종 텍스쳐             |
| 우주왕복선 전시       | codex    | `createSpaceShuttle.js` — NASA GLB 로드, Draco 압축, 받침대+조명, 부유 애니메이션 |
| 우주인 전시           | codex    | `createAstronaut.js` — NASA GLB 로드, 받침대+조명, 부유 애니메이션                |
| Gemini 우주복 전시    | codex    | `createGeminiSpacesuit.js` — NASA GLB 로드, 받침대+조명, 부유 애니메이션          |
| 우주관 분위기 연출    | codex    | `GalleryScene.jsx` — 전시실2 전용 어두운 배경/emissive 재질/HemisphereLight       |
| 전시실 이동 로직      | codex    | `GalleryPage.jsx` — 전시실2 진입 시 태양계 전시물 선택 및 도슨트 메시지           |
| AI API 장애 진단      | opencode | Gemini 429 quota, DB ORA-28000, 스키마 불일치 분석                                |
| 백엔드 실행 오류 진단 | opencode | Maven PowerShell 인자 파싱 문제 해결 방법 제시                                    |
| 문서 갱신             | opencode | WORK_LOG, HANDOVER, TASK_BOARD 2026-06-02 반영                                    |

#### 알려진 문제 (갱신)

| 문제                            | 상태 | 메모                                        |
| ------------------------------- | ---- | ------------------------------------------- |
| Gemini API 429 할당량 초과      | 열림 | Free tier 20회 소진, 키 교체 또는 대기 필요 |
| Oracle DB `C##DH1004` 계정 잠김 | 열림 | ORA-28000, DBA 조치 필요                    |
| FastAPI 응답 스키마 불일치      | 열림 | `generated` 필드 누락                       |
| 미커밋 파일 20개+               | 열림 | 우주관 3D 관련 신규/수정 파일 다수          |
| 우주관 3D 모델 비동기 로딩      | 열림 | GLB 로딩 전 카메라 시야 빈공간 가능         |

#### 남은 작업 (갱신)

| 우선순위 | 작업 ID  | 작업                            | 메모                                        |
| -------- | -------- | ------------------------------- | ------------------------------------------- |
| 긴급     | TASK-011 | AI 도슨트 API 장애 해결         | Gemini 키 교체, 스키마 수정                 |
| 높음     | TASK-012 | 역사관 GLB 모델 파일 배치       | 6개 .glb 파일 다운로드 필요, SOURCE.md 참조 |
| 중간     | TASK-002 | 백엔드 API 엔드포인트 목록 정리 | 유지                                        |
| 중간     | TASK-003 | UX 검수 기준 구체화             | 우주관 + 역사관으로 범위 확장               |
| 중간     | TASK-004 | AI 서버 외부 의존성 명세        | 유지                                        |

### 2026-06-05 추가 작업: 레트로 게임관 (Retro Game Hall) 구현

**작업자:** opencode

**완료된 부분**

| 작업                         | 설명                                                                     |
| ---------------------------- | ------------------------------------------------------------------------ |
| 레트로 게임관 전시실 구현    | hall id=4, 3종 게임 전시(피카츄 배구/TETR.IO/전쟁시대), 네온 암흑 분위기 |
| 메인 갤러리 포탈 추가        | 우측 벽 3번째 포탈(id=105, z=1.4, 핑크 네온색), 기존 포탈과 4.0 간격     |
| createGamePanel              | CSS3D CRT 모니터 패널 (640×400, 네온 테두리)                             |
| 게임 실행 모달               | 페이지 내 전체화면 오버레이 + iframe (960×720), ✕ 닫기 + 배경 클릭 종료  |
| 게임 근접감지 4.5M           | retroGameFrames 분리, 진입 시 환영 메시지, 접근 시에만 게임 설명         |
| 키프로스 제사장 상 버그 수정 | GLB 로드 시 X/Z 바운딩박스 중앙 정렬 추가                                |
| **Git 커밋 완료**            | `88e67f0 retro game hall added` — 전체 작업분 커밋                       |
| **TETR.IO 팝업 모드**        | iframe 차단 우회 — 플레이 버튼 클릭 시 960×720 팝업 창으로 실행          |
| **Ruffle 시도 → 롤백**       | Age of War HTML5 포팅 유지, Ruffle 파일 삭제                             |

**알려진 문제 (갱신)**

| 문제                    | 상태        | 메모                                                                          |
| ----------------------- | ----------- | ----------------------------------------------------------------------------- |
| 레트로 게임관 포탈 위치 | 해결        | 메인 갤러리 우측 벽 z=1.4                                                     |
| **미커밋 파일 20개+**   | **해결**    | `d4829ff`(우주관), `e00e5ad`(역사관), `88e67f0`(레트로관) 3개 커밋으로 정리   |
| TETR.IO iframe 차단     | 해결 (우회) | 팝업 모드로 대체 — `window.open('tetr.io', 'tetrio', 'width=960,height=720')` |

**남은 작업**

| 우선순위 | 작업                | 메모                                                                 |
| -------- | ------------------- | -------------------------------------------------------------------- |
| 낮음     | 팝업 차단 경고 문구 | TETR.IO 클릭 시 팝업 차단기 해제 안내 UX 추가 검토                   |
| 낮음     | 추가 게임 등록      | `retroGameDescriptions.js` + `fallbackHalls[4].exhibits`에 항목 추가 |

### 2026-06-08 추가 작업: 불필요 PS1 스크립트 정리 + 레이아웃 수정

**작업자:** opencode

**완료된 부분**

| 작업                               | 설명                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 게임 조사용 PS1 스크립트 6개 삭제  | `check_oldgames.ps1`, `check_src.ps1`, `check-oldgames2.ps1`, `fetch_emu.ps1`, `fetch_myemu.ps1`, `fetch_myemu2.ps1` — 모두 프로젝트 미사용 |
| 레이아웃 뷰포트 맞춤 수정          | `.gallery-page`/`.scene-shell`/미디어쿼리 `min-height` → `height`로 변경하여 스크롤바 제거                                                  |
| `extensions.txt` `.gitignore` 추가 | VS Code 더미 파일 제외                                                                                                                      |
| 원격 `test` 브랜치 푸시            | 커밋 후 `git push origin test`                                                                                                              |

---

### 2026-06-04 추가 작업

**작업자:** opencode

**완료된 부분**

| 작업                           | 설명                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| 역사/예술관 전시실 구현        | hall id=3, 그리스 조각상 6종 GLB 로드 인프라, 골드 포탈       |
| createPortal 색상 커스터마이징 | portalColor/ringColor/ringEmissive/glowColor 옵션 추가        |
| 따뜻한 석조 분위기 연출        | buildRoom/setupLighting roomId=3 분기, 적은 조명, 따뜻한 색감 |
| 백엔드 DataInitializer         | Hall 3 + return portal 시드 데이터 추가                       |
| 문서 갱신                      | WORK_LOG, HANDOVER, TASK_BOARD 반영                           |

**알려진 문제 (갱신)**

| 문제                            | 상태 | 메모                                                                                |
| ------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| Gemini API 429 할당량 초과      | 열림 | Free tier 20회 소진, 키 교체 또는 대기 필요                                         |
| Oracle DB `C##DH1004` 계정 잠김 | 열림 | ORA-28000, DBA 조치 필요                                                            |
| FastAPI 응답 스키마 불일치      | 열림 | `generated` 필드 누락                                                               |
| 미커밋 파일 20개+               | 해결 | 3개 커밋으로 전부 정리됨. `d4829ff`(우주관), `e00e5ad`(역사관), `88e67f0`(레트로관) |
| **역사관 GLB 모델 파일 미배치** | 열림 | 6개 .glb 파일 없으면 받침대만 표시됨                                                |
| 우주관 3D 모델 비동기 로딩      | 열림 | GLB 로딩 전 카메라 시야 빈공간 가능                                                 |
| 레트로 게임관 포탈 위치         | 해결 | 메인 갤러리 우측 벽 z=1.4 (기존 포탈 간격 4.0 유지)                                 |

### 2026-06-08 추가 작업: 전시관 데이터 단일 원본화

**작업자:** codex

| 항목             | 내용                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-015                                                                                                                                                                                                                              |
| 상태             | DONE                                                                                                                                                                                                                                  |
| 완료             | `shared/gallery-seed.json` 생성, 프론트 fallback 연결, 백엔드 버전 기반 재시드 연결, 전시관 ID 유지 방식 적용                                                                                                                         |
| 다음 작업        | 공유 또는 운영 DB에서 자동 재시드를 제한할 필요가 있는지 결정                                                                                                                                                                         |
| 먼저 확인할 파일 | `shared/gallery-seed.json`, `frontend/src/data/gallerySeed.js`, `backend/src/main/java/com/example/aiexhibition/global/config/DataInitializer.java`, `backend/src/main/java/com/example/aiexhibition/global/config/SeedMetadata.java` |
| 주의 사항        | 전시 데이터 변경 후 DB에도 반영하려면 JSON 최상단 `version`을 증가시킨다. 기본 프로필의 DB도 저장된 시드 버전이 낮으면 재시드된다.                                                                                                    |
| 검증 결과        | `npm run build`, `mvn test`, `git diff --check` 성공. local H2 API에서 메인 전시물 9개, 영상 ID `T24rF_x0TmQ`, 포탈 벽 이미지 0개 확인.                                                                                               |

**재발 방지 보완:** 최신 변경은 현재 `origin/test`에 있으며 `origin/main`보다 4커밋 앞서 있다. 다른 컴퓨터가 `main`을 실행하면 구버전 백엔드 시드가 실행된다. 최신 프론트는 공유 시드에 없는 API 전시물을 표시하지 않도록 보완했고 Vite는 5173 포트 충돌 시 실패하도록 설정했다.

**추가 진단:** 최신 Git을 받은 뒤에도 오래된 8080/5173 프로세스가 살아 있으면 화면은 계속 구버전으로 보인다. 새 백엔드의 `/api/health`에서 `gitCommit`, `branch`, `dirty`, `seedChecksum`, `startedAt`을 확인한다. `/api/health`가 없거나 오류라면 구버전 백엔드 프로세스가 실행 중인 것이다. 시드는 버전과 JSON SHA-256 체크섬을 함께 비교하므로 같은 버전의 내용 변경도 재시드된다.

**포탈 벽 보호:** 메인 전시관 포탈 벽은 `x=+8.82` 방향이다. `GalleryScene.jsx`에서 메인 전시관의 `positionX > 7` 비포탈 전시물을 렌더링하지 않도록 보호 조건을 추가했다. 따라서 오래된 API 데이터가 남아 있어도 해당 벽에는 포탈만 표시된다.

**근본 해결로 변경:** 위 포탈 벽 렌더링 보호 조건은 제거했다. 앞으로는 서버를 개별 명령으로 실행하지 말고 저장소 루트에서 `.\scripts\dev.cmd restart`를 사용한다. 이 명령은 이 저장소 소유 프로세스만 종료하고 현재 checkout에서 세 서버를 다시 시작한 뒤 `/api/health` 커밋·브랜치 일치를 검증한다. `.\scripts\dev.cmd status`로 포트별 `projectOwned`와 실행 커밋을 확인할 수 있다.

### 2026-06-09 추가 작업: 좌표 조회와 AI 데이터 전달 병합 점검

**작업자:** codex

| 항목             | 내용                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-018                                                                                                                                                                                                                                        |
| 상태             | DONE, 단 Git 병합 커밋 미생성                                                                                                                                                                                                                   |
| 완료             | `GalleryPage.jsx`에서 숫자형 DB 전시물만 좌표 기반 조회를 사용하도록 분리했다. 문자열 ID 정적 전시물은 제목·설명·키워드·예시문을 직접 보낸다. `AiService`는 근접 조회된 전시물의 `keywords`와 `exampleText`를 보존한다. 회귀 테스트를 추가했다. |
| 먼저 확인할 파일 | `frontend/src/pages/GalleryPage.jsx`, `frontend/src/api/aiApi.js`, `backend/src/main/java/com/example/aiexhibition/ai/AiService.java`, `backend/src/test/java/com/example/aiexhibition/ai/AiServiceTest.java`                                   |
| 주의 사항        | 직접 전시물 전송 경로에 `userPosition`을 다시 추가하면 Spring이 좌표 조회를 우선하여 정적 전시물 데이터가 무시된다. 근접 조회 결과를 새 AI 요청으로 만들 때 `exhibit.keywords()`와 `exhibit.exampleText()`를 유지해야 한다.                     |
| 검증 결과        | `npm run build` 성공, `mvn test` 성공, FastAPI unittest 6개 성공, `git diff --check` 성공, 미해결 충돌 없음.                                                                                                                                    |
| 다음 작업        | 실제 브라우저에서 별이 빛나는 밤과 정적 전시물 각각의 AI 설명 요청 및 응답을 확인한다. 팀원 변경과 이번 수정은 스테이징되어 있으므로 검토 후 병합 커밋을 생성한다.                                                                              |

### 2026-06-09 추가 작업: GalleryScene 기능별 분리 + 프론트엔드 개선 보수

**작업자:** opencode

| 항목             | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| 작업 ID          | TASK-019                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 상태             | DONE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 완료             | **(Phase 1)** GalleryPage — 질문 실패 시 `requestedExhibitIdRef` 초기화. GalleryScene — 공간관/역사관 일반 exhibits 렌더링되도록 skip 조건 제거. **(Phase 2)** GalleryScene.jsx 846→477줄, 6개 파일로 분할 (`sceneUtils.js`, `buildRoom.js`, `setupLighting.js`, `placeExhibit.js`, `createRemoteVisitor.js`, `syncRemoteVisitors.js`). 중복 근접 감지 3회→2회 통합. ExhibitInfoPanel 이미지 로딩 실패 시 onError 숨김. GalleryVoiceChat `<audio autoPlay>` 제거. **(Phase 3 — 전면 주석)** 초기 7개 파일에서 확장하여 frontend 전체 40개 파일에 한국어 주석 추가 (루트 2, API 2, 컴포넌트 5, 데이터 1, 페이지 1, 실시간 2, 3D 27). 모든 파일 상단 역할 설명 + 주요 함수 앞 1~2줄 주석. styles.css 12개 섹션 구분. |
| 먼저 확인할 파일 | `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/sceneUtils.js`, `frontend/src/three/buildRoom.js`, `frontend/src/three/setupLighting.js`, `frontend/src/three/placeExhibit.js`, `frontend/src/three/createRemoteVisitor.js`, `frontend/src/three/syncRemoteVisitors.js`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/components/ExhibitInfoPanel.jsx`, `frontend/src/components/GalleryVoiceChat.jsx`, `frontend/src/components/DocentSpeechBubble.jsx`                                                                                                                                                                                                                                         |
| 주의 사항        | `scheduleFallback` 지연시간 2000ms. 실패 시 "AI 도슨트 응답을 가져오지 못했습니다" → 2초 후 저장된 설명으로 자동 전환. Phase 3(UX 개선)과 Phase 4(TypeScript/테스트)는 추후 별도 작업으로 연기됨.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 검증 결과        | `npm run build` 성공. 1635 modules transformed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |     |

### 2026-06-10: 프론트엔드 이동 및 충돌 로직 커스텀 훅 분리

**작업자:** Gemini CLI

| 항목             | 내용                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID          | TASK-020                                                                                                                                                   |
| 상태             | DONE                                                                                                                                                       |
| 완료             | `GalleryScene.jsx`에서 이동 및 입력 처리 로직을 `useGalleryMovement.js` 커스텀 훅으로 완전히 분리.                                                         |
| 다음 작업        | 리소스 관리 최적화 (Asset Loader 도입), 렌더링 성능 최적화 (InstancedMesh 등).                                                                             |
| 먼저 확인할 파일 | `frontend/src/three/hooks/useGalleryMovement.js`, `frontend/src/three/GalleryScene.jsx`                                                                    |
| 주의 사항        | 이동 로직 수정 시 `useGalleryMovement.js` 내부의 `update` 함수를 수정한다. Three.js 카메라 및 렌더러와 밀접하게 연동되어 있으므로 변경 시 주의가 필요하다. |
| 검증 결과        | `npm run build` 성공 (1636 modules transformed).                                                                                                           |

### 2026-06-11: WebLLM 생성 품질 보강

- 기본 WebLLM 모델은 `Qwen2.5-1.5B-Instruct-q4f16_1-MLC`이다. 필요하면 `VITE_WEB_LLM_MODEL_ID`로 재정의할 수 있다.
- 프롬프트는 한국어로 작성되며, 전달된 전시물 정보 밖의 작가명·작품명·연도·재료를 만들지 않도록 지시한다.
- `source: "error"`인 과거 AI 메시지는 다음 WebLLM 대화 문맥에서 제외한다.
- 생성 결과에 기존 실패 문구가 있거나, 한국어가 지나치게 적거나, 전시물 근거에 없는 영문 단어가 다수 포함되면 저장 설명문 기반 응답으로 교체한다.
- 실제 브라우저에서 최초 모델 다운로드 후 한국어 생성 속도와 GPU 메모리 사용량을 확인해야 한다. 빌드는 성공했으며 WebLLM 동적 청크 크기 경고는 기존과 동일하다.

### 2026-06-11: 우주관 3D 모델 메타데이터 인덱스 오류 수정

**작업자:** opencode

| 항목             | 내용                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID          | TASK-025                                                                                                                                                                                         |
| 상태             | DONE                                                                                                                                                                                             |
| 완료             | `spaceGalleryRuntime.js`의 `metadataIndexes` 배열에서 존재하지 않는 인덱스 9를 6으로 수정했다. `spaceGalleryModels[9]` 접근 시 `TypeError`로 인해 우주관 장면 생성이 실패하던 문제가 해결되었다. |
| 먼저 확인할 파일 | `frontend/src/three/spaceGalleryRuntime.js:24`                                                                                                                                                   |
| 주의 사항        | 인덱스 6은 `spaceGalleryModels`의 '통신 위성'(satellite) 항목이다.                                                                                                                               |
| 검증 결과        | `npm run build` 성공. 우주관 진입 시 수동 확인 필요.                                                                                                                                             |

### 2026-06-11: TASK-024 구현 전 계획

| 항목             | 내용                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상태             | TODO, 구현하지 않음                                                                                                                                                                     |
| 목표             | Qwen 1.5B 품질을 유지하면서 응답 체감 속도를 개선하고 JSON 기반 자유 요청을 처리한다.                                                                                                   |
| 성능 계획        | 모델 사전 준비, 최대 160토큰, 최근 대화 6개, 작품 개요의 안전한 즉시 첫 문장과 이후 검증된 문장 단위 스트리밍                                                                           |
| 자유 요청 계획   | 작품 위치·유사 작품·전시관 테마·관람 추천은 작품명·전시관명·키워드·세션 방문 기록으로 JSON을 먼저 검색하고 관련 결과만 WebLLM에 전달한다.                                               |
| 역할 경계        | WebLLM은 큐레이터 자연어 생성만 담당한다. 좌표 검색, 대상 ID 확정, 이동·강조 실행은 프론트가 검증된 데이터와 허용 목록으로 처리한다.                                                    |
| 먼저 확인할 파일 | `frontend/src/api/webLlmApi.js`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/curator/CuratorSessionContext.jsx`, `frontend/src/data/gallerySeed.js`, `shared/gallery-seed.json` |
| 주의 사항        | 작품 개요가 아닌 자유 질문에 저장 설명문 첫 문장을 무조건 표시하지 않는다. 스트리밍 중간 조각은 세션 기록에 저장하지 않으며, 전체 JSON을 매 요청마다 모델에 넣지 않는다.                |
| 구현 순서        | 1. 스트리밍 콜백과 모델 사전 준비 API 설계, 2. 160토큰·최근 6개 적용, 3. 요청 유형 및 JSON 검색 모듈, 4. 구조화 응답 검증과 이동 UI 연결, 5. 실제 WebGPU 기기 성능·정확성 검증          |

### 2026-06-11: 통합 실행 검증 상태

- 현재 실행 기준은 `test@89fc704`이며 프론트 5173, 백엔드 8080, AI 서버 8010 포트가 실제로 열려 있다.
- 프론트·백엔드·AI 서버 자동 테스트와 주요 HTTP 연결은 정상이다.
- 외부 Gemini 생성은 `ai-server/.env`의 `GEMINI_API_KEY`, `GEMINI_API_KEYS` 값이 비어 있어 실패한다. 키 원문을 추적 파일에 기록하지 말고 로컬 `.env`에서만 설정해야 한다.
- `.\scripts\dev.cmd status`는 실행 중인 자식 프로세스를 `stopped`로 표시하는 문제가 있다. 실제 상태는 포트, health 엔드포인트, `logs/*.log`로 확인해야 하며 실행기 PID 추적은 별도 수정이 필요하다.
- 프론트 로컬 개발 서버는 `https://localhost:5173`으로 접속한다. `frontend/.cert/dev-https.pfx`가 존재하면 Vite가 HTTPS로 구동된다.
- 현재 PFX는 자체 서명 인증서라 기본 Chrome 인증서 검사에서 `ERR_CERT_AUTHORITY_INVALID` 경고가 발생한다. HTTPS 주소 복원 요청에 따라 HTTP 기본 전환은 되돌렸다.

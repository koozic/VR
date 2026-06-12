# 작업 보드

이 문서는 작업 상태를 관리한다. 모든 작업은 작업 ID를 기준으로 추적하며, 작업자는 고정 역할이 아니라 현재 작업의 담당자로만 기록한다.

## 상태 정의

| 상태    | 의미                                                    |
| ------- | ------------------------------------------------------- |
| TODO    | 아직 시작하지 않은 작업                                 |
| DOING   | 현재 진행 중인 작업                                     |
| REVIEW  | 구현 또는 문서 작성 후 검토가 필요한 작업               |
| BLOCKED | 외부 정보, 권한, 의존성 문제 등으로 진행이 막힌 작업    |
| DONE    | 완료 조건을 만족하고 작업 로그와 인수인계가 갱신된 작업 |

## 작업 작성 규칙

- [ ] 작업 ID는 `TASK-001` 형식으로 작성한다.
- [ ] 수정 가능 파일과 수정 금지 파일을 반드시 적는다.
- [ ] 완료 조건은 검증 가능한 문장으로 작성한다.
- [ ] 진행 상황은 작업 중에도 갱신한다.
- [ ] 작업 종료 시 `WORK_LOG.md`와 `HANDOVER.md`를 함께 갱신한다.

## 현재 작업 목록

### TASK-001: AI 작업 운영 문서 구축

| 항목           | 내용                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-001                                                                                                                                                                                             |
| 작업명         | AI 작업 운영 문서 구축                                                                                                                                                                               |
| 상태           | DONE                                                                                                                                                                                                 |
| 현재 담당자    | 2026-05-29 문서 작성 작업자                                                                                                                                                                          |
| 작업 목적      | 작업자가 교체되어도 프로젝트 운영이 중단되지 않도록 공통 문서 체계를 만든다.                                                                                                                         |
| 수정 가능 파일 | `ai_command/AI_WORKFLOW.md`, `ai_command/PROJECT_VISION.md`, `ai_command/ARCHITECTURE.md`, `ai_command/DECISIONS.md`, `ai_command/TASK_BOARD.md`, `ai_command/WORK_LOG.md`, `ai_command/HANDOVER.md` |
| 수정 금지 파일 | 애플리케이션 소스 전체                                                                                                                                                                               |
| 완료 조건      | 요청된 7개 Markdown 문서가 한국어로 작성되고, 작업 로그와 인수인계가 갱신된다.                                                                                                                       |
| 현재 진행 상황 | 7개 문서 생성 완료. 확인 가능한 프로젝트 구조를 아키텍처 문서에 반영했다.                                                                                                                            |
| 참고 문서      | `README.md`, `docs/architecture.md`, `backend/pom.xml`, `frontend/package.json`, `ai-server/requirements.txt`                                                                                        |
| 인수인계 메모  | 다음 작업자는 실제 API 목록, 실행 검증 결과, 제품 요구사항을 보강하면 된다.                                                                                                                          |

### TASK-002: 백엔드 API 엔드포인트 목록 정리

| 항목           | 내용                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| 작업 ID        | TASK-002                                                                 |
| 작업명         | 백엔드 API 엔드포인트 목록 정리                                          |
| 상태           | TODO                                                                     |
| 현재 담당자    | 미배정                                                                   |
| 작업 목적      | 프론트엔드와 AI 서버 연동 시 사용할 백엔드 API 계약을 명확히 한다.       |
| 수정 가능 파일 | `ai_command/ARCHITECTURE.md`, 필요 시 `docs/architecture.md`             |
| 수정 금지 파일 | 백엔드 소스 코드, 프론트엔드 소스 코드                                   |
| 완료 조건      | 컨트롤러 기준 엔드포인트, 요청/응답 DTO, 오류 응답 방식이 표로 정리된다. |
| 현재 진행 상황 | 컨트롤러 디렉터리 존재만 확인됨. 상세 엔드포인트는 미정리.               |
| 참고 문서      | `backend/src/main/java/com/example/aiexhibition/**/**Controller.java`    |
| 인수인계 메모  | 추측하지 말고 컨트롤러와 DTO 파일을 직접 확인한 뒤 작성한다.             |

### TASK-003: 프론트엔드 UX 검수 기준 구체화

| 항목           | 내용                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-003                                                                                                 |
| 작업명         | 프론트엔드 UX 검수 기준 구체화                                                                           |
| 상태           | TODO                                                                                                     |
| 현재 담당자    | 미배정                                                                                                   |
| 작업 목적      | 3D 전시 경험의 수동 검수 절차를 명확히 한다.                                                             |
| 수정 가능 파일 | `ai_command/PROJECT_VISION.md`, `ai_command/HANDOVER.md`, 필요 시 `ai_command/TASK_BOARD.md`             |
| 수정 금지 파일 | 프론트엔드 소스 코드                                                                                     |
| 완료 조건      | 데스크톱/모바일 화면 크기, 주요 시나리오, 오류 상태 확인 기준이 체크리스트로 작성된다.                   |
| 현재 진행 상황 | 기본 UX 검수 기준만 작성됨. 실제 화면 기준은 미확인.                                                     |
| 참고 문서      | `frontend/src/pages/GalleryPage.jsx`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/components/*` |
| 인수인계 메모  | 로컬 실행 후 화면을 확인하고 실제 UI 명칭과 상태를 기준으로 보강한다.                                    |

### TASK-004: AI 서버 외부 의존성 명세 정리

| 항목           | 내용                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-004                                                                                                        |
| 작업명         | AI 서버 외부 의존성 명세 정리                                                                                   |
| 상태           | TODO                                                                                                            |
| 현재 담당자    | 미배정                                                                                                          |
| 작업 목적      | AI 설명 생성에 필요한 환경 변수, 외부 API, 실패 처리 방식을 명확히 한다.                                        |
| 수정 가능 파일 | `ai_command/ARCHITECTURE.md`, `ai_command/DECISIONS.md`, 필요 시 `ai-server/.env.example`                       |
| 수정 금지 파일 | 프론트엔드 소스 코드, 백엔드 소스 코드                                                                          |
| 완료 조건      | AI 서버 환경 변수, 외부 클라이언트 동작, 오류 처리 방식이 문서화된다.                                           |
| 현재 진행 상황 | `external_ai_client.py` 존재만 확인됨. 상세 연동 방식은 미확인.                                                 |
| 참고 문서      | `ai-server/app/clients/external_ai_client.py`, `ai-server/app/services/ai_service.py`, `ai-server/.env.example` |
| 인수인계 메모  | 민감 정보는 기록하지 말고 변수명과 사용 목적만 정리한다.                                                        |

### TASK-005: 작업 시작 규칙 및 `ai_command/` ignore 정책 반영

| 항목           | 내용                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-005                                                                                                                                       |
| 작업명         | 작업 시작 규칙 및 `ai_command/` ignore 정책 반영                                                                                               |
| 상태           | DONE                                                                                                                                           |
| 현재 담당자    | 2026-05-29 문서 작성 작업자                                                                                                                    |
| 작업 목적      | 모든 작업자가 새 작업 전 확인할 문서와 작업 완료 후 갱신할 문서를 명확히 하고, `ai_command/` 폴더를 `.gitignore`에 추가한다.                   |
| 수정 가능 파일 | `ai_command/AI_WORKFLOW.md`, `ai_command/TASK_BOARD.md`, `ai_command/WORK_LOG.md`, `ai_command/HANDOVER.md`, `.gitignore`                      |
| 수정 금지 파일 | 애플리케이션 소스 전체                                                                                                                         |
| 완료 조건      | `AI_WORKFLOW.md` 최상단에 작업 시작 규칙이 추가되고, `.gitignore`에 `ai_command/`가 반영되며, `main` 브랜치 worktree에도 동일 파일이 작성된다. |
| 현재 진행 상황 | 현재 브랜치와 `main` 브랜치 worktree에 동일 내용을 반영했다.                                                                                   |
| 참고 문서      | `ai_command/AI_WORKFLOW.md`, `.gitignore`                                                                                                      |
| 인수인계 메모  | `ai_command/`는 ignore 대상이므로 Git에 추적시키려면 `git add -f ai_command/...`가 필요하다.                                                   |

### TASK-006: 운영 문서 폴더명 `ai_command` 변경

| 항목           | 내용                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-006                                                                                                                            |
| 작업명         | 운영 문서 폴더명 `ai_command` 변경                                                                                                  |
| 상태           | DONE                                                                                                                                |
| 현재 담당자    | 2026-05-29 문서 작성 작업자                                                                                                         |
| 작업 목적      | 기존 `studio` 폴더명을 `ai_command`로 변경하고, ignore 규칙과 문서 내부 참조를 일치시킨다.                                          |
| 수정 가능 파일 | `ai_command/*.md`, `.gitignore`                                                                                                     |
| 수정 금지 파일 | 애플리케이션 소스 전체                                                                                                              |
| 완료 조건      | `test` 브랜치 작업공간과 `main` 브랜치 worktree 모두에서 폴더명이 `ai_command`로 변경되고, `.gitignore`가 `ai_command/`를 가리킨다. |
| 현재 진행 상황 | 양쪽 작업공간에서 폴더명, `.gitignore`, 문서 내부 경로 참조를 변경했다.                                                             |
| 참고 문서      | `ai_command/AI_WORKFLOW.md`, `ai_command/HANDOVER.md`, `.gitignore`                                                                 |
| 인수인계 메모  | `ai_command/`는 ignore 대상이므로 Git에 포함하려면 강제 추가가 필요하다.                                                            |

### TASK-007: 전시실/작품 portal·map 필드 추가

| 항목           | 내용                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-007                                                                                               |
| 작업명         | 전시실/작품 portal·map 필드 추가                                                                       |
| 상태           | DONE                                                                                                   |
| 현재 담당자    | soldesk                                                                                                |
| 작업 목적      | 전시실(Hall)과 전시 작품(Exhibit) 엔티티에 portal 연결 정보와 map 데이터 필드를 추가한다.              |
| 수정 가능 파일 | `backend/.../exhibit/`, `backend/.../hall/`, `backend/.../global/config/DataInitializer.java`          |
| 수정 금지 파일 | 프론트엔드 소스 코드, AI 서버 소스 코드                                                                |
| 완료 조건      | Hall/Exhibit 엔티티와 DTO/Controller/Service에 portal·map 필드가 반영되고 시드 데이터가 정상 로딩된다. |
| 현재 진행 상황 | 엔티티, DTO, Controller, Service, DataInitializer 모두 수정 완료. 커밋 `1218088`.                      |
| 참고 문서      | `backend/src/main/java/com/example/aiexhibition/exhibit/Exhibit.java`, `hall/Hall.java`                |
| 인수인계 메모  | portal/map을 활용한 전시실 이동 UI와 지도 표시는 추가 작업으로 분리 가능.                              |

### TASK-008: 프론트엔드 컴포넌트 및 3D 장면 개선

| 항목           | 내용                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-008                                                                                                                                                                                                      |
| 작업명         | 프론트엔드 컴포넌트 및 3D 장면 개선                                                                                                                                                                           |
| 상태           | REVIEW                                                                                                                                                                                                        |
| 현재 담당자    | soldesk                                                                                                                                                                                                       |
| 작업 목적      | 전시 정보 패널, 전시실 HUD, 도슨트 말풍선, 3D 장면(GalleryScene, createExhibitFrame)을 개선한다.                                                                                                              |
| 수정 가능 파일 | `frontend/src/components/`, `frontend/src/three/`, `frontend/src/pages/`, `frontend/src/styles.css`, `frontend/src/api/`                                                                                      |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                           |
| 완료 조건      | UI 컴포넌트와 3D 장면이 정상 렌더링되고, 전시 정보가 올바르게 표시된다.                                                                                                                                       |
| 현재 진행 상황 | 컴포넌트 및 3D 장면 대폭 수정 완료. 프론트엔드 AI 도슨트 요청 UX 개선(중복 요청 취소, 캐시, 로딩 상태 명확화) 및 `npm run build` 검증 완료. 백엔드 실행 확인(Oracle DB, 전시 15개). 커밋 완료 (`3073a3b` 외). |
| 참고 문서      | `frontend/src/components/ExhibitInfoPanel.jsx`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/pages/GalleryPage.jsx`                                                                                   |
| 인수인계 메모  | —                                                                                                                                                                                                             |

### TASK-010: 우주관 3D 모델 전시 구현

| 항목           | 내용                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-010                                                                                                                                                                                                                     |
| 작업명         | 우주관 3D 모델 전시 구현                                                                                                                                                                                                     |
| 상태           | REVIEW                                                                                                                                                                                                                       |
| 현재 담당자    | codex                                                                                                                                                                                                                        |
| 작업 목적      | 전시실 2(우주관)에 NASA 3D Resources 기반 실물 전시물(태양계, 우주왕복선, 우주인, Gemini 우주복)을 배치한다.                                                                                                                 |
| 수정 가능 파일 | `frontend/src/three/createSolarSystem.js`, `createSpaceShuttle.js`, `createAstronaut.js`, `createGeminiSpacesuit.js`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/pages/GalleryPage.jsx`, `frontend/public/assets/` |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                                          |
| 완료 조건      | 전시실2에 4종 3D 모델이 정상 렌더링되고, 부유 애니메이션이 동작하며, 도슨트 메시지가 표시된다.                                                                                                                               |
| 현재 진행 상황 | 코드 구현 및 에셋 추가 완료. 커밋 완료 (`d4829ff`). 실행 및 렌더링 확인 필요.                                                                                                                                                |
| 참고 문서      | `WORK_LOG.md` 2026-06-02, `HANDOVER.md` 2026-06-02                                                                                                                                                                           |
| 인수인계 메모  | GLB 모델 비동기 로딩이므로 초기 렌더링 시 빈 공간이 보일 수 있음.                                                                                                                                                            |

### TASK-012: 역사/예술관 전시실 구현

| 항목           | 내용                                                                                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-012                                                                                                                                                                                                                                                           |
| 작업명         | 역사/예술관 전시실 구현 (Greek Sculpture Gallery)                                                                                                                                                                                                                  |
| 상태           | REVIEW                                                                                                                                                                                                                                                             |
| 현재 담당자    | opencode                                                                                                                                                                                                                                                           |
| 작업 목적      | 메인 전시실(1)에 세 번째 전시실(역사/예술관, hall id=3)을 추가하고 그리스 조각상 6종 3D 모델을 배치한다.                                                                                                                                                           |
| 수정 가능 파일 | `frontend/src/pages/GalleryPage.jsx`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/createPortal.js`, `frontend/src/three/createGreekStatue.js`, `frontend/src/three/greekSculptureDescriptions.js`, `backend/.../global/config/DataInitializer.java` |
| 수정 금지 파일 | 기존 전시실(1, 2) 관련 소스, AI 서버 소스                                                                                                                                                                                                                          |
| 완료 조건      | 메인 전시실 우주관 포탈 옆에 골드색 역사관 포탈이 표시되고, 포탈 진입 시 따뜻한 석조 분위기의 전시실에 6개 마블 받침대가 보이며, 근접 시 설명문이 표시된다.                                                                                                        |
| 현재 진행 상황 | 코드 구현 완료. GLB 모델 파일이 있으므로 실제 조각상 렌더링 가능. `npm run build` 성공. 커밋 완료 (`e00e5ad`).                                                                                                                                                     |
| 참고 문서      | `WORK_LOG.md` 2026-06-04, `HANDOVER.md` 2026-06-04                                                                                                                                                                                                                 |
| 인수인계 메모  | 6개 GLB 파일이 `frontend/public/assets/greek/`에 배치되어 있음. 다운로드 경로는 `SOURCE.md` 참조.                                                                                                                                                                  |

### TASK-011: AI 도슨트 API 장애 해결

| 항목           | 내용                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-011                                                                                                                                                           |
| 작업명         | AI 도슨트 API 장애 해결                                                                                                                                            |
| 상태           | REVIEW                                                                                                                                                             |
| 현재 담당자    | codex                                                                                                                                                              |
| 작업 목적      | `/api/ai/explain` API가 Gemini API 할당량 초과로 작품 설명을 출력하지 못하는 문제를 해결한다.                                                                      |
| 수정 가능 파일 | `ai-server/.env` (API 키 교체), `ai-server/app/schemas/ai_response.py` (generated 필드 추가)                                                                       |
| 수정 금지 파일 | 백엔드 소스 코드, 프론트엔드 소스 코드 (3D 모델 제외)                                                                                                              |
| 완료 조건      | Gemini API 키가 유효한 키로 교체되고, ai-server 재시작 후 `/api/ai/explain`이 정상 응답을 반환한다.                                                                |
| 현재 진행 상황 | 유효 키와 다중 키 순환을 설정하고 전체 요청 경로에서 `generated=true`를 확인했다. 연결 장애는 해결됐으며, 근거 없는 표현과 문장 수 위반에 대한 품질 검토가 남았다. |
| 참고 문서      | `ai-server/.env`, `ai-server/app/schemas/ai_response.py`, `ai-server/app/clients/external_ai_client.py`, `WORK_LOG.md` 2026-06-02                                  |
| 인수인계 메모  | 연결과 키 순환 구현은 `TASK-017` 및 `HANDOVER.md` 2026-06-09 항목 참고. 생성 후 품질 검증 정책 결정이 필요하다.                                                    |

### TASK-014: 불필요 PS1 스크립트 정리 및 레이아웃 뷰포트 맞춤

| 항목           | 내용                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-014                                                                                                             |
| 작업명         | 불필요 PS1 스크립트 정리 및 레이아웃 뷰포트 맞춤                                                                     |
| 상태           | DONE                                                                                                                 |
| 현재 담당자    | opencode                                                                                                             |
| 작업 목적      | 게임관 조사용 PowerShell 스크립트 6개 제거. 화면 크기별 스크롤바 문제 해결을 위해 레이아웃을 정확히 뷰포트에 맞춘다. |
| 수정 가능 파일 | `frontend/src/styles.css`, `.gitignore`                                                                              |
| 수정 금지 파일 | 백엔드, AI 서버 소스 코드                                                                                            |
| 완료 조건      | 6개 PS1 파일 삭제, `min-height` → `height` 변경으로 스크롤바 제거, 커밋 후 `origin test`에 푸시.                     |
| 현재 진행 상황 | 완료. 삭제 6개, 수정 2개(`styles.css`, `.gitignore`). `git push origin test` 완료.                                   |
| 참고 문서      | `WORK_LOG.md` 2026-06-08                                                                                             |
| 인수인계 메모  | 없음                                                                                                                 |

### TASK-013: 레트로 게임관 (Retro Game Hall) 전시실 구현

| 항목           | 내용                                                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-013                                                                                                                                                                                                                                       |
| 작업명         | 레트로 게임관 전시실 구현 (Retro Game Hall)                                                                                                                                                                                                    |
| 상태           | DONE                                                                                                                                                                                                                                           |
| 현재 담당자    | opencode                                                                                                                                                                                                                                       |
| 작업 목적      | 메인 전시실(1)에 네 번째 전시실(레트로 게임관, hall id=4)을 추가하고 3종 레트로 웹게임(피카츄 배구, 전쟁시대, TETR.IO)을 전시한다.                                                                                                             |
| 수정 가능 파일 | `frontend/src/three/retroGameDescriptions.js`, `frontend/src/three/createGamePanel.js`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/components/ExhibitInfoPanel.jsx`, `frontend/src/styles.css` |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                                                            |
| 완료 조건      | 메인 갤러리 우측 벽에 3번째 네온 핑크 포탈 표시, 포탈 진입 시 암흑 네온 분위기 전시실에 3개 게임 패널 표시, 근접 시 게임 설명 + 🎮 플레이하기 버튼, 버튼 클릭 시 페이지 내 모달로 게임 iframe 실행                                             |
| 현재 진행 상황 | 코드 구현 완료. 3종 게임 전시 + 모달 실행 + 4.5M 근접감지. TETR.IO popup 모드(window.open 960×720) 적용 완료. Age of War HTML5 포팅 정상 작동. `npm run build` 성공. 커밋 완료 (`88e67f0`).                                                    |
| 참고 문서      | `WORK_LOG.md` 2026-06-05, `HANDOVER.md` 2026-06-05                                                                                                                                                                                             |
| 인수인계 메모  | 추가 게임 등록은 `retroGameDescriptions.js` + `fallbackHalls[4].exhibits`에 항목 추가.                                                                                                                                                         |

### TASK-009: DB 스키마 및 시드 데이터 수정

| 항목           | 내용                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-009                                                                                                                                       |
| 작업명         | DB 스키마 및 시드 데이터 수정                                                                                                                  |
| 상태           | REVIEW                                                                                                                                         |
| 현재 담당자    | soldesk                                                                                                                                        |
| 작업 목적      | DB 스키마를 갱신하고, The Starry Night 썸네일 경로 변경 마이그레이션 SQL을 추가한다.                                                           |
| 수정 가능 파일 | `sql/`, `backend/.../global/config/DataInitializer.java`, `backend/.../exhibit/Exhibit.java`                                                   |
| 수정 금지 파일 | 프론트엔드 소스 코드, AI 서버 소스 코드                                                                                                        |
| 완료 조건      | 마이그레이션 SQL이 작성되고 DataInitializer가 변경된 스키마에 맞게 수정된다.                                                                   |
| 현재 진행 상황 | `sql/db.sql` 수정, `migration_v2_update_starry_night_thumbnail.sql` 생성, DataInitializer/Exhibit 수정 완료. 커밋 완료 (`3073a3b`, `e00e5ad`). |
| 참고 문서      | `sql/db.sql`, `sql/migration_v2_update_starry_night_thumbnail.sql`, `backend/.../DataInitializer.java`                                         |
| 인수인계 메모  | 마이그레이션 SQL 적용 시 시퀀스 순서를 확인한다.                                                                                               |

### TASK-015: 전시관 데이터 단일 원본화

| 항목           | 내용                                                                                                                                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-015                                                                                                                                                                                                                                                               |
| 작업명         | 프론트 fallback과 백엔드 시드 데이터 단일 원본화                                                                                                                                                                                                                       |
| 상태           | DONE                                                                                                                                                                                                                                                                   |
| 현재 담당자    | codex                                                                                                                                                                                                                                                                  |
| 작업 목적      | 서로 다른 프론트 fallback과 백엔드 시드 때문에 구버전 전시물과 영상이 노출되는 문제를 제거한다.                                                                                                                                                                        |
| 수정 가능 파일 | `shared/gallery-seed.json`, `frontend/src/data/gallerySeed.js`, `frontend/src/pages/GalleryPage.jsx`, `backend/src/main/java/com/example/aiexhibition/global/config/`, `backend/src/main/java/com/example/aiexhibition/hall/Hall.java`, `backend/pom.xml`, `README.md` |
| 수정 금지 파일 | AI 서버 코드, 3D 렌더링 코드                                                                                                                                                                                                                                           |
| 완료 조건      | 프론트와 백엔드가 같은 공유 JSON을 사용하고, 빌드·테스트 및 local API에서 새 영상과 포탈 벽 이미지 제거 상태가 확인된다.                                                                                                                                               |
| 현재 진행 상황 | 구현 및 검증 완료. 공유 시드 버전은 `2`이며 영상 ID는 `T24rF_x0TmQ`, 메인 포탈 벽 이미지 수는 0개다.                                                                                                                                                                   |
| 참고 문서      | `WORK_LOG.md` 2026-06-08 기록, `DECISIONS.md` ADR-003                                                                                                                                                                                                                  |
| 인수인계 메모  | 전시 구성을 바꿀 때 `shared/gallery-seed.json`을 수정한다. DB 재시드가 필요하면 최상단 `version`도 증가시킨다.                                                                                                                                                         |

### TASK-016: 구버전 로컬 프로세스 실행 차단

| 항목           | 내용                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-016                                                                                                               |
| 작업명         | 프로젝트 전용 통합 실행 및 실행 버전 검증                                                                              |
| 상태           | DONE                                                                                                                   |
| 현재 담당자    | codex                                                                                                                  |
| 작업 목적      | Git 최신 코드와 무관하게 기존 Java/Vite/Python 프로세스가 계속 응답하는 상황을 차단한다.                               |
| 수정 가능 파일 | `scripts/`, `backend/src/main/java/com/example/aiexhibition/global/`, `README.md`, `.gitignore`                        |
| 수정 금지 파일 | 전시관 렌더링 로직                                                                                                     |
| 완료 조건      | 현재 저장소 소유 프로세스만 교체하고, 새 백엔드 실행 커밋과 현재 checkout이 일치함을 자동 검증한다.                    |
| 현재 진행 상황 | 구현 및 실제 재시작 검증 완료. 두 번의 restart에서 프로세스 PID 교체와 `projectOwned=True`, `test@177e8c7`을 확인했다. |
| 참고 문서      | `WORK_LOG.md` 2026-06-08 기록, `DECISIONS.md` ADR-004                                                                  |
| 인수인계 메모  | 전체 서버 실행은 저장소 루트에서 `.\scripts\dev.cmd restart`, 확인은 `.\scripts\dev.cmd status`를 사용한다.            |

### TASK-017: AI 도슨트 키워드·예시 데이터 경로 및 다중 키 연동

| 항목           | 내용                                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-017                                                                                                                                                                                                                          |
| 작업명         | AI 도슨트 키워드·예시 데이터 경로 및 다중 Gemini 키 연동                                                                                                                                                                          |
| 상태           | DONE                                                                                                                                                                                                                              |
| 현재 담당자    | codex                                                                                                                                                                                                                             |
| 작업 목적      | 프론트에서 전달한 작품 키워드와 예시 설명문이 Spring과 FastAPI를 거쳐 AI 생성 프롬프트에 반영되도록 하고, Gemini API 키 한도 소진 시 제한적으로 다른 키를 사용한다.                                                               |
| 수정 가능 파일 | `shared/gallery-seed.json`, `frontend/src/api/aiApi.js`, `backend/src/main/java/com/example/aiexhibition/{ai,exhibit,hall,keyword,global}/`, `ai-server/app/`, `ai-server/tests/`, `ai-server/scripts/`, `ai-server/.env.example` |
| 수정 금지 파일 | API 키 원문이 포함되는 추적 파일, 관련 없는 3D 렌더링 및 에셋 파일                                                                                                                                                                |
| 완료 조건      | 별이 빛나는 밤의 키워드·예시문이 공유 시드에서 프론트와 백엔드 API로 전달되고 AI 프롬프트에 포함된다. 다중 키 순환과 quota 오류 처리가 테스트되며 전체 빌드가 통과한다.                                                           |
| 현재 진행 상황 | 구현 및 검증 완료. 공유 시드 버전은 `3`이다. 로컬 `/api/halls/1` 응답에서 별이 빛나는 밤의 키워드 3개와 예시문을 확인했다.                                                                                                        |
| 참고 문서      | `WORK_LOG.md` 2026-06-09 기록, `DECISIONS.md` ADR-005, `shared/gallery-seed.json`                                                                                                                                                 |
| 인수인계 메모  | API 키 원문은 `ai-server/.env`에만 있고 Git에서 제외된다. 실제 생성 품질에는 불필요한 인사말과 근거 없는 표현이 남을 수 있어 후속 검증이 필요하다.                                                                                |

### TASK-018: 좌표 기반 근접 조회와 AI 기준 데이터 전달 로직 병합 점검

| 항목           | 내용                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-018                                                                                                                                                                                                      |
| 작업명         | 좌표 기반 근접 조회와 AI 기준 데이터 전달 로직 병합 점검                                                                                                                                                      |
| 상태           | DONE                                                                                                                                                                                                          |
| 현재 담당자    | codex                                                                                                                                                                                                         |
| 작업 목적      | 팀원의 좌표 기반 전시물 조회와 기존 키워드·예시 설명문 전달 로직이 서로 우회하거나 중복 수행되지 않도록 통합한다.                                                                                             |
| 수정 가능 파일 | `frontend/src/api/aiApi.js`, `frontend/src/pages/GalleryPage.jsx`, `backend/src/main/java/com/example/aiexhibition/ai/AiService.java`, `backend/src/test/java/com/example/aiexhibition/ai/AiServiceTest.java` |
| 수정 금지 파일 | 관련 없는 팀원 변경 파일, API 키 원문이 포함된 파일                                                                                                                                                           |
| 완료 조건      | DB 전시물의 좌표 조회와 정적 전시물의 직접 전송이 각각 유지되고, 근접 조회된 전시물의 키워드·예시문이 FastAPI까지 보존되며 전체 테스트가 통과한다.                                                            |
| 현재 진행 상황 | 충돌 및 중복 문제 수정 완료. 프론트 빌드, Spring 테스트, FastAPI 테스트, Git 충돌 검사를 통과했다. 병합 커밋은 아직 생성하지 않았다.                                                                          |
| 참고 문서      | `WORK_LOG.md` 2026-06-09 TASK-018 기록, `DECISIONS.md` ADR-006                                                                                                                                                |
| 인수인계 메모  | 숫자형 DB 전시물만 좌표 조회를 사용한다. 문자열 ID 정적 전시물 요청에는 `userPosition`을 보내지 않아야 한다.                                                                                                  |

### TASK-020: 프론트엔드 이동 및 충돌 로직 커스텀 훅 분리

| 항목           | 내용                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-020                                                                                                                                     |
| 작업명         | 프론트엔드 이동 및 충돌 로직 커스텀 훅 분리                                                                                                  |
| 상태           | DONE                                                                                                                                         |
| 현재 담당자    | Gemini CLI                                                                                                                                   |
| 작업 목적      | `GalleryScene.jsx`에 집중된 이동, 키보드/마우스 입력 처리, 충돌 감지 로직을 별도의 커스텀 훅으로 분리하여 모듈성을 높이고 가독성을 개선한다. |
| 수정 가능 파일 | `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/hooks/useGalleryMovement.js` (신규)                                               |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                          |
| 완료 조건      | 이동 로직이 `useGalleryMovement.js`로 성공적으로 이전되고, `GalleryScene.jsx`가 이 훅을 사용하도록 수정되며, `npm run build`가 통과한다.     |
| 현재 진행 상황 | 완료. 이동 및 입력 로직을 성공적으로 분리하고 `npm run build`를 통해 검증 완료.                                                              |
| 참고 문서      | `frontend/src/three/GalleryScene.jsx`, `ai_command/AI_WORKFLOW.md`                                                                           |
| 인수인계 메모  | 분리 시 Three.js 객체(Camera, Renderer 등)와의 의존성 주입에 유의한다.                                                                       |

### TASK-021: 프론트 개선 선별 유지 및 AI 요청 경합 제거

| 항목           | 내용                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-021                                                                                                                                                                                                     |
| 작업명         | 프론트 개선 선별 유지 및 AI 요청 경합 제거                                                                                                                                                                   |
| 상태           | DONE                                                                                                                                                                                                         |
| 현재 담당자    | codex                                                                                                                                                                                                        |
| 작업 목적      | 새 프론트 개선 중 유효한 기능은 유지하고, 요청별 설명 변화 요구를 막거나 화면 상태를 뒤늦게 덮어쓰는 회귀 요소는 제거한다.                                                                                   |
| 수정 가능 파일 | `frontend/src/api/aiApi.js`, `frontend/src/components/DocentSpeechBubble.jsx`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/hooks/useGalleryMovement.js` |
| 수정 금지 파일 | 백엔드 및 AI 서버 코드, 관련 없는 프론트 파일                                                                                                                                                                |
| 완료 조건      | 동일 요청 캐시가 제거되고, 이전 AI 요청과 fallback이 새 작품·질문·방 이동 상태를 덮어쓰지 않으며, 이동 훅 입력 이벤트가 렌더러 DOM 생성 후 연결되고 빌드가 통과한다.                                         |
| 현재 진행 상황 | 완료. 유효한 개선만 유지했으며 `npm run build`, `git diff --check`를 통과했다.                                                                                                                               |
| 참고 문서      | `WORK_LOG.md` 2026-06-10 TASK-021 기록, `DECISIONS.md` ADR-007                                                                                                                                               |
| 인수인계 메모  | 설명 캐시는 매 요청마다 미묘하게 다른 설명을 생성해야 한다는 요구와 충돌하므로 복원하지 않는다. 로컬 브라우저 연결을 사용할 수 없어 실제 이동 입력 수동 검증은 남아 있다.                                    |

### TASK-022: 프론트엔드 번들 분리 및 전시관별 지연 로딩

| 항목           | 내용                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-022                                                                                                       |
| 작업명         | 프론트엔드 번들 분리 및 전시관별 지연 로딩                                                                     |
| 상태           | DONE                                                                                                           |
| 현재 담당자    | codex                                                                                                          |
| 작업 목적      | 초기 페이지에서 사용하지 않는 전시관별 3D 모델 생성기와 로더를 분리해 초기 앱 번들과 빌드 경고를 줄인다.       |
| 수정 가능 파일 | `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/*GalleryRuntime.js`, `frontend/vite.config.js`      |
| 완료 조건      | 우주관·역사관 코드가 별도 지연 청크로 생성되고, 앱·React·Three 코어가 분리되며 빌드 경고 없이 빌드가 통과한다. |
| 현재 진행 상황 | 완료. 앱 청크 119KB, React 192KB, Three 코어 561KB, 전시관 런타임 및 DRACO 별도 청크 생성 확인.                |
| 참고 문서      | `WORK_LOG.md` 2026-06-10 TASK-022 기록, `DECISIONS.md` ADR-008                                                 |
| 인수인계 메모  | 우주관·역사관은 런타임 모듈 로드 전 장면 생성을 기다린다. 실제 첫 진입 UX 수동 검증은 남아 있다.               |

### TASK-023: 세션 단위 대화형 큐레이터 및 WebLLM 하이브리드 대화

| 항목           | 내용                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-023                                                                                                                                                                                                                                                                  |
| 작업명         | 세션 단위 대화형 큐레이터 및 WebLLM 하이브리드 대화                                                                                                                                                                                                                       |
| 상태           | DOING                                                                                                                                                                                                                                                                     |
| 현재 담당자    | codex                                                                                                                                                                                                                                                                     |
| 작업 목적      | 자동 작품 설명 중심 흐름을 사용자가 선택지·텍스트·음성으로 대화를 시작하고 세션 전체에서 이어갈 수 있는 가상 큐레이터 서비스로 확장한다.                                                                                                                                  |
| 수정 가능 파일 | `frontend/src/App.jsx`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/api/`, `ai-server/app/`, 필요 시 `backend/src/main/`                                                                                       |
| 수정 금지 파일 | API 키 원문이 포함된 추적 파일, 관련 없는 3D 모델·에셋                                                                                                                                                                                                                    |
| 완료 조건      | 접근 시 저장 설명만 표시되고, 카테고리별 추천 선택지 및 자유 텍스트·음성 대화가 가능하다. 최초 선택지 설명은 외부 API, 후속 대화는 WebLLM이 처리한다. 사용자 입력과 모든 AI 응답은 세션 전체 히스토리에 저장되고 작품·전시관 이동 후에도 열람·대화 지속이 가능하다.       |
| 현재 진행 상황 | WebLLM 병합 충돌 정리 완료. 접근 시 저장 설명문, 추천 선택지 최초 외부 API, 텍스트·음성·후속 대화 WebLLM 라우팅을 적용했다. WebLLM은 현재 전시물 근거와 오류 응답을 제외한 최근 세션 메시지 8개를 사용하며 응답 출처를 구분한다.                                          |
| 참고 문서      | `ARCHITECTURE.md` 대화형 큐레이터 목표 구조, `DECISIONS.md` ADR-009, `HANDOVER.md` TASK-023 계획                                                                                                                                                                          |
| 인수인계 메모  | 전체 히스토리 저장과 모델 입력 컨텍스트를 분리한다. 선택지 조회 우선순위는 `exhibit.curatorOptions` -> `exhibitConversationProfiles` -> 유형 기본값이다. WebLLM 동적 청크가 약 6MB라 Vite 크기 경고가 발생하며 실제 브라우저 모델 로딩·WebGPU 미지원 UX 검증이 남아 있다. |

### TASK-025: 우주관 3D 모델 메타데이터 인덱스 오류 수정

| 항목           | 내용                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-025                                                                                                                                   |
| 작업명         | 우주관 3D 모델 메타데이터 인덱스 오류 수정                                                                                                 |
| 상태           | DONE                                                                                                                                       |
| 현재 담당자    | opencode                                                                                                                                   |
| 작업 목적      | `spaceGalleryRuntime.js`의 `metadataIndexes` 배열에 존재하지 않는 인덱스 9가 포함되어 우주관 진입 시 TypeError가 발생하는 버그를 수정한다. |
| 수정 가능 파일 | `frontend/src/three/spaceGalleryRuntime.js`                                                                                                |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드, 기타 프론트엔드 전시관 파일                                                                           |
| 완료 조건      | `metadataIndexes[8]`이 `9`에서 `6`으로 변경되어 `spaceGalleryModels[9]` 접근 시도로 인한 크래시가 제거된다.                                |
| 현재 진행 상황 | 수정 완료. 인덱스 `9` → `6`으로 변경. `npm run build` 성공.                                                                                |
| 참고 문서      | `WORK_LOG.md` 2026-06-11 TASK-025 기록                                                                                                     |
| 인수인계 메모  | 이 수정으로 `spaceGalleryModels`의 인덱스 6(satellite)이 models 배열의 인덱스 6(createSatellite)에 올바르게 매핑된다.                      |

### TASK-026: 우주관/역사관 첫 진입 시 로딩 UX 검토

| 항목           | 내용                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-026                                                                                                                                                              |
| 작업명         | 우주관/역사관 첫 진입 시 로딩 UX 검토                                                                                                                                 |
| 상태           | TODO                                                                                                                                                                  |
| 현재 담당자    | 미배정                                                                                                                                                                |
| 작업 목적      | 특수 전시관(space, history) 진입 시 동적 import로 인한 로딩 시간 동안 사용자에게 빈 화면이 아닌 로딩 표시를 제공할지 결정하고 구현한다.                               |
| 수정 가능 파일 | `frontend/src/three/GalleryScene.jsx`, `frontend/src/components/`, `frontend/src/styles.css`                                                                          |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드, 전시관 런타임 로직                                                                                                               |
| 완료 조건      | 우주관/역사관 첫 진입 시 로딩 인디케이터 추가 여부가 결정되고, 필요 시 구현되어 브라우저에서 확인된다.                                                                |
| 현재 진행 상황 | 미시작. GalleryScene의 동적 import 완료 전 조기 return으로 빈 화면이 발생할 수 있음.                                                                                  |
| 참고 문서      | `HANDOVER.md` 2026-06-10 TASK-022 인수인계, `WORK_LOG.md` TASK-022 후속 작업 제안                                                                                     |
| 인수인계 메모  | GalleryScene.jsx:139의 `if ((isSpaceGallery \|\| isHistoryGallery) \&\& galleryRuntime.roomId !== Number(roomConfig?.id)) return;` 가드가 로딩 중 빈 화면을 유발한다. |

### TASK-027: 프론트엔드 이동·입력·요청 경합 수동 검증

| 항목           | 내용                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-027                                                                                                                   |
| 작업명         | 프론트엔드 이동·입력·요청 경합 수동 검증                                                                                   |
| 상태           | TODO                                                                                                                       |
| 현재 담당자    | 미배정                                                                                                                     |
| 작업 목적      | WASD 이동, 포인터 잠금, 빠른 작품 전환, 방 이동 중 AI 요청 취소 등 핵심 UX 시나리오를 실제 브라우저에서 수동 검증한다.     |
| 수정 가능 파일 | 검증 결과에 따라 수정 필요 시 `frontend/src/three/hooks/useGalleryMovement.js`, `frontend/src/pages/GalleryPage.jsx`       |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                        |
| 완료 조건      | WASD/방향키 이동, 마우스 시야 회전, 포인터 잠금, 작품 근접 포커스, 포탈 진입, 빠른 연속 전환 시 설명 경합 없음이 확인된다. |
| 현재 진행 상황 | 미시작. `TASK-021`에서 로직 개선 완료했으나 브라우저 수동 검증은 미수행.                                                   |
| 참고 문서      | `WORK_LOG.md` 2026-06-10 TASK-021, `HANDOVER.md` 2026-06-10 TASK-021 검증 결과                                             |
| 인수인계 메모  | 로컬 브라우저 연결 불가로 인해 수동 검증이 계속 미뤄지고 있다. `dirty` 상태에서 dev 서버 재시작 후 확인 필요.              |

### TASK-028: TETR.IO 팝업 차단 경고 UX 개선

| 항목           | 내용                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-028                                                                                                               |
| 작업명         | TETR.IO 팝업 차단 경고 UX 개선                                                                                         |
| 상태           | TODO                                                                                                                   |
| 현재 담당자    | 미배정                                                                                                                 |
| 작업 목적      | TETR.IO가 iframe 차단으로 팝업 모드로 실행될 때, 브라우저 팝업 차단기가 활성화된 경우 사용자에게 안내 문구를 표시한다. |
| 수정 가능 파일 | `frontend/src/components/ExhibitInfoPanel.jsx`, `frontend/src/pages/GalleryPage.jsx`                                   |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드, 3D 렌더링 로직                                                                    |
| 완료 조건      | TETR.IO 실행 시 팝업 차단 해제 안내가 사용자에게 표시되거나, 대체 실행 방식이 적용된다.                                |
| 현재 진행 상황 | 미시작. 현재 `window.open`으로 팝업 실행 중이며 차단 시 별도 피드백 없음.                                              |
| 참고 문서      | `HANDOVER.md` 2026-06-05 추가 작업 남은 작업 항목                                                                      |
| 인수인계 메모  | iframe 차단 정책은 TETR.IO 서버 측 설정이므로 우회 불가. 안내 문구 또는 대체 게임 URL 확보가 필요.                     |

### TASK-029: 3D 리소스 관리 및 렌더링 성능 최적화

| 항목           | 내용                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-029                                                                                                                   |
| 작업명         | 3D 리소스 관리 및 렌더링 성능 최적화                                                                                       |
| 상태           | TODO                                                                                                                       |
| 현재 담당자    | 미배정                                                                                                                     |
| 작업 목적      | GLB 모델 중복 로드 방지를 위한 Asset Loader 도입, InstancedMesh 등 렌더링 성능 최적화를 검토하고 적용한다.                 |
| 수정 가능 파일 | `frontend/src/three/` 관련 파일, `frontend/src/three/hooks/`                                                               |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드, 전시 메타데이터                                                                       |
| 완료 조건      | Asset Loader 도입 여부와 InstancedMesh 적용 범위가 결정되고, 필요한 경우 구현되어 빌드가 통과한다.                         |
| 현재 진행 상황 | 미시작. 현재 GLB 로더가 전시관 재진입 시 매번 새 로드함.                                                                   |
| 참고 문서      | `WORK_LOG.md` 2026-06-10 TASK-020 후속 작업 제안                                                                           |
| 인수인계 메모  | 전시관 전환 시 이전 장면 리소스는 cleanup에서 dispose되나, 동일 GLB 파일의 중복 로드는 방지되지 않음. 캐싱 전략 결정 필요. |

### TASK-030: 레트로 게임관 3D 아케이드 캐비닛 모델 추가

| 항목           | 내용                                                                                                                                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-030                                                                                                                                                                                                                                                                                        |
| 작업명         | 레트로 게임관 3D 아케이드 캐비닛 모델 추가                                                                                                                                                                                                                                                      |
| 상태           | DONE                                                                                                                                                                                                                                                                                            |
| 현재 담당자    | opencode                                                                                                                                                                                                                                                                                        |
| 작업 목적      | 레트로 게임관(hall 4)에 기존 CSS3D 패널 대신 3D 아케이드 게임기 캐비닛을 절차적 지오메트리로 추가한다.                                                                                                                                                                                          |
| 수정 가능 파일 | `frontend/src/three/createRetroCabinet.js`, `frontend/src/three/retroGalleryRuntime.js`, `frontend/src/three/retroGameDescriptions.js`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/pages/GalleryPage.jsx`                                                                             |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                                                                                                             |
| 완료 조건      | 레트로 게임관 진입 시 5종 3D 아케이드 캐비닛이 바닥에 배치되어 렌더링되고, 근접 시 게임 정보가 표시되며 플레이 버튼으로 실행 가능하다. 동적 청크가 정상 생성되고 빌드가 통과한다.                                                                                                               |
| 현재 진행 상황 | 구현 완료. `createRetroCabinet.js` — 게임기 본체/스크린/마퀴/조이스틱/네온 포함 절차적 3D 모델. `retroGalleryRuntime.js` — 5개 캐비닛 배치, 근접감지 프레임 반환. `GalleryScene.jsx` — roomId 4 동적 import + 런타임 통합. `GalleryPage.jsx` — retroGameModels 참조 추가. `npm run build` 성공. |
| 참고 문서      | `WORK_LOG.md` 2026-06-12 TASK-030, `HANDOVER.md` 2026-06-12 TASK-030                                                                                                                                                                                                                            |
| 인수인계 메모  | 3D 캐비닛은 외부 GLB 파일 의존성 없이 절차적으로 생성됨. 게임 실행은 `ExhibitInfoPanel` → `handleGameLaunch` 경로 유지. 실제 브라우저 렌더링 수동 확인 필요.                                                                                                                                    |

### TASK-024: WebLLM 체감 속도 개선 및 JSON 기반 전시 안내 확장

| 항목           | 내용                                                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-024                                                                                                                                                                                                                         |
| 작업명         | WebLLM 체감 속도 개선 및 JSON 기반 전시 안내 확장                                                                                                                                                                                |
| 상태           | TODO                                                                                                                                                                                                                             |
| 현재 담당자    | 미배정                                                                                                                                                                                                                           |
| 작업 목적      | WebLLM의 한국어 품질을 유지하면서 응답 체감 속도를 높이고, 자유 입력으로 작품 위치·유사 작품·전시관 테마·관람 추천을 정확하게 안내한다.                                                                                          |
| 수정 가능 파일 | `frontend/src/api/webLlmApi.js`, `frontend/src/pages/GalleryPage.jsx`, `frontend/src/curator/`, `frontend/src/components/`, `frontend/src/data/`, 필요 시 `shared/gallery-seed.json`                                             |
| 수정 금지 파일 | API 키 원문 포함 파일, 관련 없는 3D 모델·에셋, 검증 없이 전시 좌표를 변경하는 작업                                                                                                                                               |
| 완료 조건      | Qwen 1.5B를 유지하면서 모델 사전 준비, 최대 160토큰, 최근 대화 6개, 안전한 스트리밍 표시가 동작한다. 자유 입력은 JSON 검색 결과를 근거로 작품 위치·유사 작품·전시관 테마를 답하고, 이동 요청은 허용된 프론트 동작으로 분리한다.  |
| 현재 진행 상황 | 구현 전 계획만 확정했다. 코드 수정은 이후 작업에서 수행한다.                                                                                                                                                                     |
| 참고 문서      | `ARCHITECTURE.md`의 WebLLM 응답 속도 및 JSON 기반 자유 요청 처리 계획, `DECISIONS.md` ADR-010                                                                                                                                    |
| 인수인계 메모  | 전체 JSON을 매 요청마다 모델에 넣지 않는다. 프론트가 작품명·전시관명·키워드·세션 방문 기록으로 관련 데이터를 먼저 검색하고, WebLLM은 검색 결과만 자연어로 설명한다. 좌표와 이동 동작은 WebLLM이 추측하거나 직접 실행하지 않는다. |

### TASK-031: Gemini 다중 키 정책 문서화

| 항목           | 내용                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-031                                                                                                                                               |
| 작업명         | Gemini 다중 키 정책 문서화                                                                                                                             |
| 상태           | TODO                                                                                                                                                   |
| 현재 담당자    | 미배정                                                                                                                                                 |
| 작업 목적      | 현재 구현된 Gemini 다중 키 라운드로빈, 키 쿨다운, 제한적 전환 규칙을 문서화하여 운영 정책을 명확히 한다.                                               |
| 수정 가능 파일 | `ai_command/GEMINI_KEY_POLICY.md` (신규), `ai_command/HANDOVER.md`                                                                                     |
| 수정 금지 파일 | API 키 원문 포함 파일, 애플리케이션 소스 코드                                                                                                          |
| 완료 조건      | 새 문서 `GEMINI_KEY_POLICY.md`에서 현재 다중 키 구현, 라운드로빈 규칙, 300초 쿨다운, auth/quota 오류만 전환하는 정책, .env 보안 체크리스트가 작성된다. |
| 현재 진행 상황 | 미시작. 구현만 완료되었으며 정책 문서는 없음.                                                                                                          |
| 참고 문서      | `ai-server/app/clients/external_ai_client.py`, `ai-server/app/services/ai_service.py`, `HANDOVER.md` 2026-06-09 Gemini 다중 키 구현 기록               |
| 인수인계 메모  | API 키 원문과 생성 방법은 기록하지 않는다. 변수명, 환경 설정, 쿨다운 시간, 오류 처리만 기록한다.                                                       |

### TASK-032: 기술 부채 추적 시작

| 항목           | 내용                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 작업 ID        | TASK-032                                                                                                                                   |
| 작업명         | 기술 부채 추적 시작                                                                                                                        |
| 상태           | REVIEW                                                                                                                                     |
| 현재 담당자    | opencode                                                                                                                                   |
| 작업 목적      | 우선순위가 낮으나 지속적으로 개선해야 할 기술적 제약과 성능 문제를 별도로 추적하여 계획 수립을 돕는다.                                     |
| 수정 가능 파일 | `ai_command/TECHNICAL_DEBT.md` (신규), `ai_command/HANDOVER.md`                                                                            |
| 수정 금지 파일 | 애플리케이션 소스 코드                                                                                                                     |
| 완료 조건      | 새 문서 `TECHNICAL_DEBT.md`에서 WebLLM 로딩 UX 미보완, 3D 리소스 캐싱 미구현, 번들 경고, 성능 메트릭 미측정 등이 우선순위와 함께 기록된다. |
| 현재 진행 상황 | 구현 완료. TECHNICAL_DEBT.md 생성 및 8개 기술 부채 항목 등록 (HIGH 2, MEDIUM 4, LOW 2). 우선순위 및 해결 방법 정의.                        |
| 참고 문서      | `TASK_BOARD.md` TASK-026~029, `HANDOVER.md` 완료된 부분과 남은 작업 섹션                                                                   |
| 인수인계 메모  | 기술 부채는 기능 완성이 아닌 품질·성능·운영 개선이므로 별도 추적이 필요하다. 각 항목의 우선순위와 예상 작업량을 참고하여 계획 수립.        |

### TASK-033: 문서-코드 일관성 검증 자동화 계획

| 항목           | 내용                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-033                                                                                                                           |
| 작업명         | 문서-코드 일관성 검증 자동화 계획                                                                                                  |
| 상태           | TODO                                                                                                                               |
| 현재 담당자    | 미배정                                                                                                                             |
| 작업 목적      | Java 버전, Spring Boot 버전 등 중요 메타데이터가 ARCHITECTURE.md와 pom.xml에 불일치하는 문제를 방지하기 위해 검증 방법을 계획한다. |
| 수정 가능 파일 | `ai_command/VALIDATION_CHECKLIST.md` (신규), 필요 시 `.github/workflows/` 또는 CI/CD 스크립트                                      |
| 수정 금지 파일 | 애플리케이션 소스 코드                                                                                                             |
| 완료 조건      | 문서-코드 동기화 검증 방법이 `VALIDATION_CHECKLIST.md`로 정리되고, 향후 CI 자동화 가능성이 평가된다.                               |
| 현재 진행 상황 | 미시작. Java 25 vs Java 17 불일치 발견 후 제안됨.                                                                                  |
| 참고 문서      | `ARCHITECTURE.md` 기술 스택 섹션, `backend/pom.xml`                                                                                |
| 인수인계 메모  | 초기 계획 단계이므로 실제 자동화 구현은 TASK-033 이후 별도 작업으로 진행.                                                          |

### TASK-034: 3D 전시물 물리 충돌 연산 추가

| 항목           | 내용                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-034                                                                                                                                                                                                                                                             |
| 작업명         | 3D 전시물 물리 충돌 연산 추가                                                                                                                                                                                                                                        |
| 상태           | DONE                                                                                                                                                                                                                                                                 |
| 현재 담당자    | Gemini CLI                                                                                                                                                                                                                                                           |
| 작업 목적      | 아케이드 캐비닛 및 주요 전시물(우주관, 역사관)을 플레이어가 통과하지 못하도록 물리 충돌 판정을 추가하여 가상 현실의 몰입감을 높인다.                                                                                                                                |
| 수정 가능 파일 | `frontend/src/three/hooks/useGalleryMovement.js`, `frontend/src/three/GalleryScene.jsx`, `frontend/src/three/create*.js`                                                                                                                                             |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                                                                                  |
| 완료 조건      | `useGalleryMovement.js`에 충돌 로직이 반영되고, 주요 3D 모델에 `collisionRadius`가 설정되어 이동 중 차단됨이 로직상으로 확인되며 `npm run build`가 통과한다.                                                                                                        |
| 현재 진행 상황 | 완료. 원형 충돌 감지 로직 구현 및 아케이드 캐비닛, 그리스 조각상, 우주관 모델(화성 로버, 로켓, 우주왕복선, 태양계)에 충돌 반경 적용 완료.                                                                                                                            |
| 참고 문서      | `frontend/src/three/hooks/useGalleryMovement.js`, `frontend/src/three/GalleryScene.jsx`                                                                                                                                                                              |
| 인수인계 메모  | 현재는 단순 원형 충돌이며, 향후 벽면이나 더 복잡한 메쉬 충돌이 필요할 경우 `Octree` 또는 `cannon.js` 같은 물리 엔진 도입을 검토할 수 있다.                                                                                                                          |

### TASK-035: 유저 이동 속도 조절(달리기) 기능 추가

| 항목           | 내용                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-035                                                                                                                                                                                           |
| 작업명         | 유저 이동 속도 조절(달리기) 기능 추가                                                                                                                                                              |
| 상태           | DONE                                                                                                                                                                                               |
| 현재 담당자    | Gemini CLI                                                                                                                                                                                         |
| 작업 목적      | 전시관 내에서 유저가 빠르게 이동할 수 있도록 Shift 키를 이용한 달리기 기능을 추가하여 편의성을 개선한다.                                                                                           |
| 수정 가능 파일 | `frontend/src/three/hooks/useGalleryMovement.js`                                                                                                                                                   |
| 수정 금지 파일 | 백엔드 소스 코드, AI 서버 소스 코드                                                                                                                                                                |
| 완료 조건      | Shift 키를 누르고 이동할 때 속도가 기본 대비 1.5배(3.2 -> 4.8)로 증가하며, 키를 떼면 다시 기본 속도로 돌아온다.                                                                                   |
| 현재 진행 상황 | 완료. `useGalleryMovement.js`의 `update` 함수에 Shift 키 감지 로직 및 속도 배수(1.5배) 적용 완료.                                                                                                         |
| 참고 문서      | `frontend/src/three/hooks/useGalleryMovement.js`                                                                                                                                                   |
| 인수인계 메모  | 현재 기본 속도 3.2, 달리기 속도 4.8로 설정되어 있으며, 추후 UX 피드백에 따라 속도 조절이 필요할 수 있다.                                                                                         |

### TASK-036: 레트로 게임관 플레이 버튼 복구

| 항목           | 내용                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 작업 ID        | TASK-036                                                                                                                                                                                                      |
| 작업명         | 레트로 게임관 플레이 버튼 복구                                                                                                                                                                                |
| 상태           | DONE                                                                                                                                                                                                          |
| 현재 담당자    | codex                                                                                                                                                                                                         |
| 작업 목적      | 3D 아케이드 캐비닛 전환 이후 레트로 게임 정보 패널에서 사라진 `플레이하기` 버튼을 복구한다.                                                                                                                   |
| 수정 가능 파일 | `frontend/src/three/retroGameDescriptions.js`, `ai_command/TASK_BOARD.md`, `ai_command/WORK_LOG.md`, `ai_command/HANDOVER.md`, `ai_command/TECHNICAL_DEBT.md`                                               |
| 수정 금지 파일 | 백엔드 및 AI 서버 소스 코드, 레트로 게임 URL                                                                                                                                                                  |
| 완료 조건      | 레트로 게임 5종이 `game` 타입과 `contentUrl`을 보유하여 근접 선택 시 게임 뱃지와 플레이 버튼이 표시되고, 기존 3D 캐비닛 근접 감지와 게임 실행 경로를 유지하며 프론트 빌드가 통과한다.                            |
| 현재 진행 상황 | 완료. `retroGameDescriptions.js`의 5개 게임 타입을 `model`에서 `game`으로 복구했다. `npm run build` 성공 및 5개 게임 데이터 검증 완료.                                                                       |
| 참고 문서      | `WORK_LOG.md` 2026-06-12 TASK-036, `HANDOVER.md` 2026-06-12 TASK-036                                                                                                                                          |
| 인수인계 메모  | 3D 표시 방식과 의미 타입을 혼동하지 않는다. 캐비닛은 `retroGalleryRuntime.js`가 3D 모델로 생성하고, UI 및 큐레이터 분류를 위해 게임 데이터의 `type`은 반드시 `game`이어야 한다. 빌드 경고는 기술 부채 문서 참고. |

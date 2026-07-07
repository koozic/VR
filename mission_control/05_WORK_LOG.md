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

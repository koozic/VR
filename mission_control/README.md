# Mission Control

이 폴더는 여러 AI 작업자와 사람이 교체되며 참여해도 프로젝트 컨텍스트를 잃지 않도록 유지하는 중앙 통제실이다.  
특정 프레임워크, 제품 유형, AI 모델에 종속되지 않는 범용 운영 문서 체계로 사용한다.

## 사용 원칙

| 원칙 | 설명 |
| --- | --- |
| 먼저 읽고 나중에 수정 | 작업자는 코드보다 이 폴더를 먼저 읽는다. |
| 추측 금지 | 확인되지 않은 내용은 사실처럼 쓰지 않고 `작성 필요`로 남긴다. |
| 범위 고정 | 현재 작업 범위 밖의 코드는 임의로 정리하거나 재구성하지 않는다. |
| 이유 기록 | 코드 변경보다 왜 그렇게 바꿨는지가 더 오래 남는다. |
| 다음 작업자 우선 | 모든 문서는 다음 사람이 바로 이어받을 수 있게 작성한다. |

## 작업 시작 전 읽는 순서

| 순서 | 문서 | 목적 |
| --- | --- | --- |
| 1 | [00_AI_WORKER_RULES.md](./00_AI_WORKER_RULES.md) | AI 작업자의 행동 수칙과 시작/종료 체크리스트 확인 |
| 2 | [01_STATUS_BOARD.md](./01_STATUS_BOARD.md) | 현재 진행 중인 작업, 우선순위, 차단 요소 확인 |
| 3 | [02_PROJECT_CHARTER.md](./02_PROJECT_CHARTER.md) | 프로젝트 목표, 가치, 금지 원칙 확인 |
| 4 | [03_SYSTEM_MAP.md](./03_SYSTEM_MAP.md) | 전체 구조, 컴포넌트, 데이터 흐름 확인 |
| 5 | [04_DECISION_RECORDS.md](./04_DECISION_RECORDS.md) | 과거 기술 결정과 이유 확인 |
| 6 | [05_WORK_LOG.md](./05_WORK_LOG.md) | 최근 작업 이력 확인 |
| 7 | [06_HANDOFF.md](./06_HANDOFF.md) | 직전 작업자의 인수인계 확인 |

## 작업 종료 후 갱신하는 순서

| 순서 | 문서 | 갱신 기준 |
| --- | --- | --- |
| 1 | [05_WORK_LOG.md](./05_WORK_LOG.md) | 실제 수행한 변경, 검증, 남은 위험 기록 |
| 2 | [06_HANDOFF.md](./06_HANDOFF.md) | 다음 작업자가 이어받을 핵심 맥락 기록 |
| 3 | [01_STATUS_BOARD.md](./01_STATUS_BOARD.md) | 작업 상태, 우선순위, 차단 요소 갱신 |
| 4 | [04_DECISION_RECORDS.md](./04_DECISION_RECORDS.md) | 되돌리기 어려운 기술 결정이 있으면 ADR 추가 |
| 5 | [03_SYSTEM_MAP.md](./03_SYSTEM_MAP.md) | 구조나 책임 경계가 바뀌었으면 반영 |

## 문서 색인

| 파일 | 역할 |
| --- | --- |
| [00_AI_WORKER_RULES.md](./00_AI_WORKER_RULES.md) | AI 작업자 행동 수칙, 시작/종료 체크리스트 |
| [01_STATUS_BOARD.md](./01_STATUS_BOARD.md) | 현재 상태판, 우선순위, 진행 작업, 차단 요소 |
| [02_PROJECT_CHARTER.md](./02_PROJECT_CHARTER.md) | 상위 목표, 제품 가치, 제약, 금지 원칙 |
| [03_SYSTEM_MAP.md](./03_SYSTEM_MAP.md) | 아키텍처 지도, 주요 컴포넌트, 데이터 흐름 |
| [04_DECISION_RECORDS.md](./04_DECISION_RECORDS.md) | 기술 의사결정 기록 ADR |
| [05_WORK_LOG.md](./05_WORK_LOG.md) | 작업 이력 로그 |
| [06_HANDOFF.md](./06_HANDOFF.md) | 인수인계 패킷 |
| [07_TASK_CARD_TEMPLATE.md](./07_TASK_CARD_TEMPLATE.md) | 새 작업을 정의할 때 쓰는 작업 카드 템플릿 |
| [08_VERIFICATION_CHECKLIST.md](./08_VERIFICATION_CHECKLIST.md) | 변경 검증 체크리스트 |

## 빠른 운영 규칙

- [ ] 작업 시작 전 `00`부터 `06`까지 필요한 범위를 읽었다.
- [ ] 현재 요청의 범위와 완료 조건을 문장으로 정의했다.
- [ ] 코드 변경 전 관련 파일을 먼저 읽었다.
- [ ] 변경 후 테스트, 빌드, 수동 확인 중 가능한 검증을 수행했다.
- [ ] 검증하지 못한 부분은 명확히 기록했다.
- [ ] 다음 작업자를 위해 `05_WORK_LOG.md`와 `06_HANDOFF.md`를 갱신했다.


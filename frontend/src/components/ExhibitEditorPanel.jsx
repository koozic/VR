import { useEffect, useMemo, useState } from 'react';

const EXHIBIT_TYPES = [
  { value: 'image', label: '일반 이미지/작품' },
  { value: 'youtube', label: '유튜브 영상' },
  { value: 'game', label: '게임 패널' },
  { value: 'portal', label: '포털' },
];

const WALL_OPTIONS = [
  { value: 0, label: '앞쪽 벽' },
  { value: 1, label: '왼쪽 벽' },
  { value: 2, label: '오른쪽 벽' },
  { value: 3, label: '뒤쪽 벽' },
];

function isSavedExhibit(exhibit) {
  if (!exhibit?.id) return false;
  return Number.isFinite(Number(exhibit.id));
}

function textValue(value) {
  return value == null ? '' : String(value);
}

function numberValue(value, fallback = '') {
  return value == null || Number.isNaN(Number(value)) ? fallback : String(value);
}

function defaultForm(currentHall, exhibit = null) {
  return {
    title: textValue(exhibit?.title),
    creator: textValue(exhibit?.creator),
    description: textValue(exhibit?.description),
    exampleText: textValue(exhibit?.exampleText),
    type: exhibit?.type || 'image',
    contentUrl: textValue(exhibit?.contentUrl),
    thumbnailUrl: textValue(exhibit?.thumbnailUrl),
    hallId: numberValue(exhibit?.hallId ?? currentHall?.id, currentHall?.id || 1),
    wallIndex: numberValue(exhibit?.wallIndex, 0),
    rotationY: numberValue(exhibit?.rotationY),
    scale: numberValue(exhibit?.scale, 1),
    wide: Boolean(exhibit?.wide),
    positionX: numberValue(exhibit?.positionX, 0),
    positionY: numberValue(exhibit?.positionY, 2),
    positionZ: numberValue(exhibit?.positionZ, -10.82),
    portalTargetX: numberValue(exhibit?.portalTargetX),
    portalTargetZ: numberValue(exhibit?.portalTargetZ),
    portalTargetYaw: numberValue(exhibit?.portalTargetYaw),
  };
}

function emptyToNull(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toNumberOrNull(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toRequiredNumber(value, fieldLabel) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${fieldLabel} 값을 숫자로 입력해 주세요.`);
  }
  return number;
}

function buildPayload(form) {
  const title = form.title.trim();
  if (!title) {
    throw new Error('작품 제목은 필수입니다.');
  }

  return {
    title,
    creator: emptyToNull(form.creator),
    description: emptyToNull(form.description),
    exampleText: emptyToNull(form.exampleText),
    type: emptyToNull(form.type) || 'image',
    contentUrl: emptyToNull(form.contentUrl),
    wallIndex: toNumberOrNull(form.wallIndex),
    rotationY: toNumberOrNull(form.rotationY),
    scale: toNumberOrNull(form.scale),
    wide: form.wide,
    thumbnailUrl: emptyToNull(form.thumbnailUrl),
    portalTargetX: toNumberOrNull(form.portalTargetX),
    portalTargetZ: toNumberOrNull(form.portalTargetZ),
    portalTargetYaw: toNumberOrNull(form.portalTargetYaw),
    hallId: toRequiredNumber(form.hallId, '전시관 ID'),
    positionX: toRequiredNumber(form.positionX, 'X 좌표'),
    positionY: toRequiredNumber(form.positionY, 'Y 좌표'),
    positionZ: toRequiredNumber(form.positionZ, 'Z 좌표'),
  };
}

export default function ExhibitEditorPanel({
  exhibit,
  currentHall,
  getCurrentPosition,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [mode, setMode] = useState('edit');
  const [form, setForm] = useState(() => defaultForm(currentHall, exhibit));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const savedExhibit = useMemo(() => isSavedExhibit(exhibit), [exhibit]);

  useEffect(() => {
    if (mode === 'edit') {
      setForm(defaultForm(currentHall, exhibit));
      setMessage('');
    }
  }, [currentHall, exhibit, mode]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage('');
    setForm(defaultForm(currentHall, nextMode === 'edit' ? exhibit : null));
  };

  const fillCurrentPosition = () => {
    const position = getCurrentPosition?.();
    if (!position) {
      setMessage('아직 현재 위치를 읽지 못했습니다. 갤러리 안에서 한 번 움직인 뒤 다시 눌러보세요.');
      return;
    }

    setForm((previous) => ({
      ...previous,
      positionX: String(Math.round(position.x * 100) / 100),
      positionY: String(Math.round((position.y || 2) * 100) / 100),
      positionZ: String(Math.round(position.z * 100) / 100),
    }));
    setMessage('현재 관람 위치를 좌표에 반영했습니다.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const payload = buildPayload(form);
      if (mode === 'edit') {
        if (!savedExhibit) {
          throw new Error('DB에 저장된 작품만 수정할 수 있습니다. 이 작품은 seed fallback 데이터입니다.');
        }
        await onUpdate?.(exhibit.id, payload);
        setMessage('작품을 수정했습니다.');
      } else {
        await onCreate?.(payload);
        setMessage('새 작품을 추가했습니다.');
        setMode('edit');
      }
    } catch (error) {
      setMessage(error.message || '작품 정보를 저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!savedExhibit || busy) return;
    const ok = window.confirm(`"${exhibit.title}" 작품을 삭제할까요?`);
    if (!ok) return;

    setBusy(true);
    setMessage('');
    try {
      await onDelete?.(exhibit.id);
      setMessage('작품을 삭제했습니다.');
      setMode('create');
      setForm(defaultForm(currentHall, null));
    } catch (error) {
      setMessage(error.message || '작품을 삭제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel exhibit-editor">
      <div className="exhibit-editor__header">
        <div>
          <span className="side-panel__eyebrow">EXHIBIT ADMIN</span>
          <h3>작품 편집</h3>
        </div>
        <div className="exhibit-editor__tabs" role="tablist" aria-label="작품 편집 모드">
          <button
            type="button"
            className={mode === 'edit' ? 'is-active' : ''}
            onClick={() => switchMode('edit')}
            disabled={!exhibit}
          >
            수정
          </button>
          <button
            type="button"
            className={mode === 'create' ? 'is-active' : ''}
            onClick={() => switchMode('create')}
          >
            추가
          </button>
        </div>
      </div>

      {mode === 'edit' && !savedExhibit && (
        <p className="exhibit-editor__hint">
          현재 선택된 작품은 DB가 아니라 fallback seed 데이터라 바로 수정/삭제할 수 없습니다.
          같은 정보로 새 작품을 추가하려면 추가 탭을 사용하세요.
        </p>
      )}

      <form className="exhibit-editor__form" onSubmit={handleSubmit}>
        <label>
          <span>제목 *</span>
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="작품 제목"
          />
        </label>

        <label>
          <span>작가</span>
          <input
            value={form.creator}
            onChange={(event) => updateField('creator', event.target.value)}
            placeholder="작가명"
          />
        </label>

        <label>
          <span>설명</span>
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="작품 설명"
            rows={4}
          />
        </label>

        <label>
          <span>AI 예시 문장</span>
          <textarea
            value={form.exampleText}
            onChange={(event) => updateField('exampleText', event.target.value)}
            placeholder="AI 도슨트가 참고할 예시 문장"
            rows={3}
          />
        </label>

        <div className="exhibit-editor__grid">
          <label>
            <span>타입</span>
            <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
              {EXHIBIT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>전시관 ID *</span>
            <input
              type="number"
              min="1"
              value={form.hallId}
              onChange={(event) => updateField('hallId', event.target.value)}
            />
          </label>
        </div>

        <label>
          <span>콘텐츠 URL</span>
          <input
            value={form.contentUrl}
            onChange={(event) => updateField('contentUrl', event.target.value)}
            placeholder="이미지/유튜브/게임/포털 대상"
          />
        </label>

        <label>
          <span>썸네일 URL</span>
          <input
            value={form.thumbnailUrl}
            onChange={(event) => updateField('thumbnailUrl', event.target.value)}
            placeholder="액자에 표시할 이미지 주소"
          />
        </label>

        <div className="exhibit-editor__grid">
          <label>
            <span>벽</span>
            <select
              value={form.wallIndex}
              onChange={(event) => updateField('wallIndex', event.target.value)}
            >
              {WALL_OPTIONS.map((wall) => (
                <option key={wall.value} value={wall.value}>{wall.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>스케일</span>
            <input
              type="number"
              step="0.1"
              value={form.scale}
              onChange={(event) => updateField('scale', event.target.value)}
            />
          </label>
        </div>

        <div className="exhibit-editor__grid exhibit-editor__grid--three">
          <label>
            <span>X *</span>
            <input
              type="number"
              step="0.01"
              value={form.positionX}
              onChange={(event) => updateField('positionX', event.target.value)}
            />
          </label>
          <label>
            <span>Y *</span>
            <input
              type="number"
              step="0.01"
              value={form.positionY}
              onChange={(event) => updateField('positionY', event.target.value)}
            />
          </label>
          <label>
            <span>Z *</span>
            <input
              type="number"
              step="0.01"
              value={form.positionZ}
              onChange={(event) => updateField('positionZ', event.target.value)}
            />
          </label>
        </div>

        <button type="button" className="exhibit-editor__ghost" onClick={fillCurrentPosition}>
          현재 위치 좌표 가져오기
        </button>

        <label className="exhibit-editor__check">
          <input
            type="checkbox"
            checked={form.wide}
            onChange={(event) => updateField('wide', event.target.checked)}
          />
          <span>가로형 작품으로 표시</span>
        </label>

        {form.type === 'portal' && (
          <div className="exhibit-editor__portal">
            <p>포털 이동 목표</p>
            <div className="exhibit-editor__grid exhibit-editor__grid--three">
              <label>
                <span>목표 X</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.portalTargetX}
                  onChange={(event) => updateField('portalTargetX', event.target.value)}
                />
              </label>
              <label>
                <span>목표 Z</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.portalTargetZ}
                  onChange={(event) => updateField('portalTargetZ', event.target.value)}
                />
              </label>
              <label>
                <span>목표 방향</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.portalTargetYaw}
                  onChange={(event) => updateField('portalTargetYaw', event.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {message && <p className="exhibit-editor__message">{message}</p>}

        <div className="exhibit-editor__actions">
          <button type="submit" disabled={busy || (mode === 'edit' && !savedExhibit)}>
            {busy ? '저장 중...' : mode === 'edit' ? '수정 저장' : '새 작품 추가'}
          </button>
          {mode === 'edit' && (
            <button
              type="button"
              className="exhibit-editor__danger"
              onClick={handleDelete}
              disabled={busy || !savedExhibit}
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

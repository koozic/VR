import { useEffect, useMemo, useState } from 'react';
import { uploadMediaFile } from '../api/exhibitApi.js';

const EXHIBIT_TYPES = [
  { value: 'image', label: '일반 이미지/작품' },
  { value: 'video', label: '업로드 영상' },
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

const ROOM_HALF_WIDTH = 8.82;
const ROOM_HALF_DEPTH = 10.82;

const WALL_PRESETS = [
  {
    wallIndex: 0,
    label: '앞쪽 벽',
    helper: '입장 후 정면에 가까운 벽',
    spots: [
      { label: '왼쪽', x: -5.5, z: -ROOM_HALF_DEPTH, rotationY: 0 },
      { label: '중앙', x: 0, z: -ROOM_HALF_DEPTH, rotationY: 0 },
      { label: '오른쪽', x: 5.5, z: -ROOM_HALF_DEPTH, rotationY: 0 },
    ],
  },
  {
    wallIndex: 1,
    label: '왼쪽 벽',
    helper: '방 왼편 세로 벽',
    spots: [
      { label: '앞쪽', x: -ROOM_HALF_WIDTH, z: -5.5, rotationY: Math.PI / 2 },
      { label: '중앙', x: -ROOM_HALF_WIDTH, z: 0, rotationY: Math.PI / 2 },
      { label: '뒤쪽', x: -ROOM_HALF_WIDTH, z: 5.5, rotationY: Math.PI / 2 },
    ],
  },
  {
    wallIndex: 2,
    label: '오른쪽 벽',
    helper: '방 오른편 세로 벽',
    spots: [
      { label: '앞쪽', x: ROOM_HALF_WIDTH, z: -5.5, rotationY: -Math.PI / 2 },
      { label: '중앙', x: ROOM_HALF_WIDTH, z: 0, rotationY: -Math.PI / 2 },
      { label: '뒤쪽', x: ROOM_HALF_WIDTH, z: 5.5, rotationY: -Math.PI / 2 },
    ],
  },
  {
    wallIndex: 3,
    label: '뒤쪽 벽',
    helper: '입구 반대편 벽',
    spots: [
      { label: '왼쪽', x: -5.5, z: ROOM_HALF_DEPTH, rotationY: Math.PI },
      { label: '중앙', x: 0, z: ROOM_HALF_DEPTH, rotationY: Math.PI },
      { label: '오른쪽', x: 5.5, z: ROOM_HALF_DEPTH, rotationY: Math.PI },
    ],
  },
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
    docentContext: textValue(exhibit?.docentContext),
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

function roundNumber(value) {
  return String(Math.round(value * 100) / 100);
}

function filenameWithoutExtension(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

function mapPreviewPosition(form) {
  const x = Number(form.positionX);
  const z = Number(form.positionZ);

  return {
    valid: Number.isFinite(x) && Number.isFinite(z),
    left: clampPercent(((Number.isFinite(x) ? x : 0) + ROOM_HALF_WIDTH) / (ROOM_HALF_WIDTH * 2) * 100),
    top: clampPercent(((Number.isFinite(z) ? z : 0) + ROOM_HALF_DEPTH) / (ROOM_HALF_DEPTH * 2) * 100),
  };
}

function exhibitPreviewPosition(exhibit) {
  const x = Number(exhibit?.positionX);
  const z = Number(exhibit?.positionZ);

  return {
    valid: Number.isFinite(x) && Number.isFinite(z),
    left: clampPercent(((Number.isFinite(x) ? x : 0) + ROOM_HALF_WIDTH) / (ROOM_HALF_WIDTH * 2) * 100),
    top: clampPercent(((Number.isFinite(z) ? z : 0) + ROOM_HALF_DEPTH) / (ROOM_HALF_DEPTH * 2) * 100),
  };
}

function exhibitMarkerLabel(exhibit) {
  if (exhibit?.type === 'portal') return '포털';
  if (exhibit?.type === 'video' || exhibit?.type === 'youtube') return '영상';
  if (exhibit?.type === 'game') return '게임';
  return '작품';
}

function isSameExhibit(left, right) {
  if (!left?.id || !right?.id) return false;
  return String(left.id) === String(right.id);
}

function formatProfiles(profiles) {
  if (!Array.isArray(profiles) || profiles.length === 0) return 'default';
  return profiles.join(', ');
}

function buildDbNotice(backendHealth) {
  if (!backendHealth) {
    return {
      variant: 'unknown',
      title: 'DB 상태 확인 중',
      detail: '백엔드가 어떤 DB에 연결되어 있는지 확인하고 있습니다.',
    };
  }

  if (backendHealth.status === 'DOWN') {
    return {
      variant: 'danger',
      title: 'DB 상태 확인 실패',
      detail: backendHealth.message || '백엔드 /api/health 응답을 가져오지 못했습니다.',
    };
  }

  if (backendHealth.dbType === 'Oracle') {
    return {
      variant: 'safe',
      title: '현재 저장 대상: Oracle 공용 DB',
      detail: '저장하면 팀 공용 DB에 반영됩니다. 단, 업로드한 실제 파일은 현재 백엔드 PC의 uploads 폴더에 저장됩니다.',
    };
  }

  if (backendHealth.dbType === 'H2') {
    return {
      variant: 'warning',
      title: '현재 저장 대상: H2 임시 DB',
      detail: '수정은 가능하지만 서버를 다시 실행하면 사라질 수 있습니다. 팀 공용 반영은 Oracle 프로필로 백엔드를 실행해야 합니다.',
    };
  }

  return {
    variant: 'unknown',
    title: 'DB 종류를 확정하지 못했습니다',
    detail: '저장 전에 백엔드 실행 프로필과 DB 연결 정보를 확인해 주세요.',
  };
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
    docentContext: emptyToNull(form.docentContext),
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
  exhibits = [],
  currentHall,
  getCurrentPosition,
  onSelectExhibit,
  onCreate,
  onUpdate,
  onDelete,
  backendHealth,
}) {
  const [mode, setMode] = useState('edit');
  const [form, setForm] = useState(() => defaultForm(currentHall, exhibit));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const savedExhibit = useMemo(() => isSavedExhibit(exhibit), [exhibit]);
  const previewPosition = useMemo(() => mapPreviewPosition(form), [form]);
  const exhibitMarkers = useMemo(
    () => exhibits
      .map((entry) => ({
        exhibit: entry,
        preview: exhibitPreviewPosition(entry),
      }))
      .filter(({ preview }) => preview.valid),
    [exhibits],
  );
  const selectedWallLabel = WALL_OPTIONS.find(
    (wall) => String(wall.value) === String(form.wallIndex),
  )?.label || '자동';
  const dbNotice = useMemo(() => buildDbNotice(backendHealth), [backendHealth]);

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

  const handleFileUpload = async (event, target) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage('');
    try {
      const uploaded = await uploadMediaFile(file, {
        onProgress: (progress) => setUploadProgress(progress),
      });
      const isVideo = uploaded.contentType?.startsWith('video/')
        || /\.(mp4|webm|mov)$/i.test(uploaded.originalFilename || file.name);

      setForm((previous) => {
        const next = { ...previous };
        if (!next.title) {
          next.title = filenameWithoutExtension(uploaded.originalFilename || file.name);
        }
        if (target === 'video' || isVideo) {
          next.type = 'video';
          next.contentUrl = uploaded.url;
        } else {
          next.type = next.type === 'video' ? 'image' : next.type;
          next.thumbnailUrl = uploaded.url;
        }
        return next;
      });
      setMessage(
        isVideo
          ? '영상 업로드 완료. 콘텐츠 URL에 자동 입력했습니다.'
          : '이미지 업로드 완료. 썸네일 URL에 자동 입력했습니다.',
      );
    } catch (error) {
      setMessage(error.message || '파일을 업로드하지 못했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const applyPreset = (spot, wallIndex) => {
    setForm((previous) => ({
      ...previous,
      wallIndex: String(wallIndex),
      positionX: roundNumber(spot.x),
      positionY: previous.positionY || '2.18',
      positionZ: roundNumber(spot.z),
      rotationY: roundNumber(spot.rotationY),
    }));
    setMessage(`${WALL_OPTIONS[wallIndex]?.label || '벽'} ${spot.label} 위치를 적용했습니다.`);
  };

  const selectMarker = (nextExhibit) => {
    onSelectExhibit?.(nextExhibit);
    setMode('edit');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const payload = buildPayload(form);
      if (backendHealth?.dbType === 'H2') {
        const ok = window.confirm(
          '현재 백엔드는 H2 임시 DB로 실행 중입니다. 저장해도 서버를 다시 실행하면 사라질 수 있습니다. 그래도 저장할까요?',
        );
        if (!ok) return;
      }

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

      <div
        className={`exhibit-editor__db-notice exhibit-editor__db-notice--${dbNotice.variant}`}
        role="status"
      >
        <strong>{dbNotice.title}</strong>
        <p>{dbNotice.detail}</p>
        <dl>
          <div>
            <dt>프로필</dt>
            <dd>{formatProfiles(backendHealth?.profiles)}</dd>
          </div>
          <div>
            <dt>브랜치</dt>
            <dd>{backendHealth?.branch || '확인 중'}</dd>
          </div>
          <div>
            <dt>커밋</dt>
            <dd>{backendHealth?.gitCommit || '확인 중'}</dd>
          </div>
        </dl>
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

        <label>
          <span>도슨트 보강 문맥</span>
          <textarea
            value={form.docentContext}
            onChange={(event) => updateField('docentContext', event.target.value)}
            placeholder="작품별 관람 포인트, FAQ, 세부 인물 정보 JSON"
            rows={5}
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

        {mode === 'create' && (
          <>
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
          </>
        )}

        <div className="exhibit-editor__upload">
          <div>
            <strong>파일 업로드</strong>
            <p>이미지는 액자 썸네일로, 영상은 업로드 영상 타입으로 자동 설정됩니다.</p>
          </div>
          <div className="exhibit-editor__upload-actions">
            <label>
              이미지 선택
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                disabled={uploading || busy}
                onChange={(event) => handleFileUpload(event, 'thumbnail')}
              />
            </label>
            <label>
              영상 선택
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                disabled={uploading || busy}
                onChange={(event) => handleFileUpload(event, 'video')}
              />
            </label>
          </div>
          {uploading && (
            <div className="exhibit-editor__uploading">
              <span>
                파일 업로드 중입니다
                {uploadProgress == null ? '...' : ` (${uploadProgress}%)`}
              </span>
              {uploadProgress != null && (
                <progress value={uploadProgress} max="100" aria-label="파일 업로드 진행률" />
              )}
              <small>오래 멈춰 있으면 백엔드 8080 서버가 실행 중인지 확인해 주세요.</small>
            </div>
          )}
        </div>

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

        <div className="exhibit-editor__placement">
          <div className="exhibit-editor__placement-header">
            <div>
              <span>배치 미리보기</span>
              <p>위에서 내려다본 전시관입니다. 작품/포털 점을 누르면 수정 대상으로 선택됩니다.</p>
            </div>
            <strong>{selectedWallLabel}</strong>
          </div>

          <div className="exhibit-editor__map" aria-label="작품 위치 미리보기">
            <span className="exhibit-editor__map-label exhibit-editor__map-label--front">지도 위쪽: 앞쪽 벽 Z -10.82</span>
            <span className="exhibit-editor__map-label exhibit-editor__map-label--back">지도 아래쪽: 뒤쪽 벽 Z 10.82</span>
            <span className="exhibit-editor__map-label exhibit-editor__map-label--left">왼쪽 벽 X -8.82</span>
            <span className="exhibit-editor__map-label exhibit-editor__map-label--right">오른쪽 벽 X 8.82</span>
            <span className="exhibit-editor__map-center">입장/이동 공간</span>
            {exhibitMarkers.map(({ exhibit: marker, preview }) => {
              const selected = isSameExhibit(marker, exhibit);
              const portal = marker.type === 'portal';
              const markerLabel = exhibitMarkerLabel(marker);

              return (
                <button
                  type="button"
                  key={`${marker.id}-${marker.title}`}
                  className={[
                    'exhibit-editor__map-marker',
                    portal ? 'exhibit-editor__map-marker--portal' : '',
                    selected ? 'exhibit-editor__map-marker--selected' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left: `${preview.left}%`,
                    top: `${preview.top}%`,
                  }}
                  title={`${marker.title || '제목 없음'} (${markerLabel})`}
                  aria-label={`${marker.title || '제목 없음'} ${markerLabel} 선택`}
                  onClick={() => selectMarker(marker)}
                >
                  <span>{portal ? 'P' : 'A'}</span>
                </button>
              );
            })}
            {previewPosition.valid && (
              <span
                className="exhibit-editor__map-dot"
                title="현재 입력 중인 좌표"
                style={{
                  left: `${previewPosition.left}%`,
                  top: `${previewPosition.top}%`,
                }}
              />
            )}
          </div>

          <div className="exhibit-editor__map-legend" aria-label="지도 표시 설명">
            <span><i className="exhibit-editor__legend-dot exhibit-editor__legend-dot--artwork" />작품</span>
            <span><i className="exhibit-editor__legend-dot exhibit-editor__legend-dot--portal" />포털</span>
            <span><i className="exhibit-editor__legend-dot exhibit-editor__legend-dot--editing" />현재 입력 좌표</span>
          </div>

          <div className="exhibit-editor__presets">
            {WALL_PRESETS.map((wall) => (
              <div className="exhibit-editor__preset-group" key={wall.wallIndex}>
                <div>
                  <strong>{wall.label}</strong>
                  <span>{wall.helper}</span>
                </div>
                <div>
                  {wall.spots.map((spot) => (
                    <button
                      type="button"
                      key={`${wall.wallIndex}-${spot.label}`}
                      onClick={() => applyPreset(spot, wall.wallIndex)}
                    >
                      {spot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="exhibit-editor__coordinate-help">
            X는 좌우 위치, Z는 앞뒤 위치, Y는 높이입니다. 일반 벽걸이 작품은 Y를 2.18 근처로 두면 보기 편합니다.
          </p>
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

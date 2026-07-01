/* 전시물/전시관 API 호출 함수. fetchHallDetail(id)로 특정 전시관 정보를 가져옴 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchExhibits() {
  const response = await fetch(`${API_BASE_URL}/api/exhibits`);
  if (!response.ok) throw new Error('Failed to fetch exhibits');
  return response.json();
}

export async function fetchHalls() {
  const response = await fetch(`${API_BASE_URL}/api/halls`);
  if (!response.ok) throw new Error('Failed to fetch halls');
  return response.json();
}

export async function fetchHallDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/halls/${id}`);
  if (!response.ok) throw new Error('Failed to fetch hall detail');
  return response.json();
}

async function parseErrorMessage(response, fallback) {
  try {
    const body = await response.json();
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

function normalizeUploadedMediaUrl(url) {
  if (!url) return url;
  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.pathname.startsWith('/uploads/')) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
  } catch {
    return url;
  }
  return url;
}

async function sendExhibitRequest(path, options, fallbackMessage) {
  const { headers = {}, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackMessage));
  }

  if (response.status === 204) return null;
  return response.json();
}

export function createExhibit(payload) {
  return sendExhibitRequest(
    '/api/exhibits',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    '작품을 추가하지 못했습니다.',
  );
}

export function updateExhibit(id, payload) {
  return sendExhibitRequest(
    `/api/exhibits/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    '작품을 수정하지 못했습니다.',
  );
}

export function deleteExhibit(id) {
  return sendExhibitRequest(
    `/api/exhibits/${id}`,
    { method: 'DELETE' },
    '작품을 삭제하지 못했습니다.',
  );
}

export function uploadMediaFile(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/uploads`);
    xhr.timeout = 60000;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.(null);
        return;
      }
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let body = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body?.url ? { ...body, url: normalizeUploadedMediaUrl(body.url) } : body);
        return;
      }

      reject(new Error(body?.message || '파일을 업로드하지 못했습니다.'));
    };

    xhr.onerror = () => {
      reject(new Error('업로드 서버에 연결하지 못했습니다. 백엔드 8080 서버가 실행 중인지 확인해 주세요.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('업로드 응답이 너무 늦습니다. 백엔드 서버 상태와 파일 크기를 확인해 주세요.'));
    };

    xhr.onabort = () => {
      reject(new Error('파일 업로드가 중단되었습니다.'));
    };

    xhr.send(formData);
  });
}

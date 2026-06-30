/* 전시물/전시관 API 호출 함수. fetchHallDetail(id)로 특정 전시관 정보를 가져옴 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchExhibits() {
  const response = await fetch(`${API_BASE_URL}/api/exhibits`);
  if (!response.ok) throw new Error('Failed to fetch exhibits');
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

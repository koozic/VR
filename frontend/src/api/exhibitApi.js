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

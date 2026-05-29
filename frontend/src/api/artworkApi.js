const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchArtworks() {
  const response = await fetch(`${API_BASE_URL}/api/artworks`);
  if (!response.ok) throw new Error('Failed to fetch artworks');
  return response.json();
}

export async function fetchRooms() {
  const response = await fetch(`${API_BASE_URL}/api/rooms`);
  if (!response.ok) throw new Error('Failed to fetch rooms');
  return response.json();
}

export async function fetchRoomDetail(roomId) {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);
  if (!response.ok) throw new Error('Failed to fetch room detail');
  return response.json();
}

export async function fetchRoomExhibits(roomId) {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/exhibits`);
  if (!response.ok) throw new Error('Failed to fetch room exhibits');
  return response.json();
}

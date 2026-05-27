const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchArtworks() {
  const response = await fetch(`${API_BASE_URL}/api/artworks`);

  if (!response.ok) {
    throw new Error('Failed to fetch artworks');
  }

  return response.json();
}


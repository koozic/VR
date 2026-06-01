const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchExhibits() {
  const response = await fetch(`${API_BASE_URL}/api/exhibits`);

  if (!response.ok) {
    throw new Error('Failed to fetch exhibits');
  }

  return response.json();
}


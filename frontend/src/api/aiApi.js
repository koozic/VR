const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function requestDocentExplanation(artwork) {
  const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      artworkId: artwork.id,
      title: artwork.title,
      artistName: artwork.artistName,
      description: artwork.description,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request docent explanation');
  }

  return response.json();
}


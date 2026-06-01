const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function requestDocentExplanation(exhibit) {
  const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exhibitId: exhibit.id,
      title: exhibit.title,
      creator: exhibit.creator,
      description: exhibit.description,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request docent explanation');
  }

  return response.json();
}


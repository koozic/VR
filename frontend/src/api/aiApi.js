const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function numericExhibitId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export async function requestDocentExplanation(exhibit, options = {}) {
  const { userQuestion, userPosition, hallId, maxDistance } = options;
  const body = {
    userQuestion,
    userPosition,
    hallId,
    maxDistance,
  };

  if (exhibit) {
    body.exhibitId = numericExhibitId(exhibit.id);
    body.title = exhibit.title;
    body.creator = exhibit.creator;
    body.description = exhibit.description;
    body.keywords = exhibit.keywords || [
      exhibit.period,
      exhibit.material,
      exhibit.location,
    ].filter(Boolean);
    body.exampleText = exhibit.exampleText;
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to request docent explanation');
  }

  return response.json();
}


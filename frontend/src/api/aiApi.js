const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function numericExhibitId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export async function requestDocentExplanation(exhibit, options = {}) {
  const { userQuestion } = options;
  const keywords = exhibit.keywords || [
    exhibit.period,
    exhibit.material,
    exhibit.location,
  ].filter(Boolean);
  const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exhibitId: numericExhibitId(exhibit.id),
      title: exhibit.title,
      creator: exhibit.creator,
      description: exhibit.description,
      keywords,
      exampleText: exhibit.exampleText,
      userQuestion,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request docent explanation');
  }

  return response.json();
}


import gallerySeed from '../../../shared/gallery-seed.json';

export const fallbackHalls = Object.fromEntries(
  gallerySeed.halls.map((hall) => [hall.id, hall]),
);

export const mainGalleryExhibits = fallbackHalls[1].exhibits;

function exhibitKey(exhibit) {
  if (exhibit.type === 'portal') return `portal:${exhibit.title}`;
  return `${exhibit.type}:${exhibit.contentUrl || ''}:${exhibit.title}`;
}

export function mergeHallWithSeed(hall) {
  const fallbackHall = fallbackHalls[Number(hall.id)];
  if (!fallbackHall) return hall;

  const fallbackByKey = new Map(
    fallbackHall.exhibits.map((exhibit) => [exhibitKey(exhibit), exhibit]),
  );
  const apiKeys = new Set();
  const exhibits = (hall.exhibits || []).map((exhibit) => {
    const key = exhibitKey(exhibit);
    apiKeys.add(key);
    return { ...fallbackByKey.get(key), ...exhibit };
  });

  fallbackHall.exhibits.forEach((exhibit) => {
    const key = exhibitKey(exhibit);
    if (!apiKeys.has(key)) exhibits.push({ ...exhibit, id: `fallback-${exhibit.id}` });
  });

  return { ...fallbackHall, ...hall, exhibits };
}

import gallerySeed from '../../../shared/gallery-seed.json';

export const fallbackHalls = Object.fromEntries(
  gallerySeed.halls.map((hall) => [hall.id, hall]),
);

export const mainGalleryExhibits = fallbackHalls[1].exhibits;

function exhibitKey(exhibit) {
  if (exhibit.type === 'portal') return `portal:${exhibit.contentUrl}`;
  return `${exhibit.type}:${exhibit.title}`;
}

export function mergeHallWithSeed(hall) {
  const fallbackHall = fallbackHalls[Number(hall.id)];
  if (!fallbackHall) return hall;

  const apiByKey = new Map(
    (hall.exhibits || []).map((exhibit) => [exhibitKey(exhibit), exhibit]),
  );
  const exhibits = fallbackHall.exhibits.map((seedExhibit) => {
    const apiExhibit = apiByKey.get(exhibitKey(seedExhibit));
    if (!apiExhibit) return { ...seedExhibit, id: `fallback-${seedExhibit.id}` };

    return {
      ...apiExhibit,
      ...seedExhibit,
      id: apiExhibit.id,
    };
  });

  return { ...fallbackHall, ...hall, exhibits };
}

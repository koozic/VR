/* shared/gallery-seed.json을 불러와 fallback 데이터를 제공하고, API 응답과 병합 */
import gallerySeed from '../../../shared/gallery-seed.json';

export const fallbackHalls = Object.fromEntries(
  gallerySeed.halls.map((hall) => [hall.id, hall]),
);

export const mainGalleryExhibits = fallbackHalls[1].exhibits;

function exhibitKey(exhibit) {
  if (exhibit.type === 'portal') return `portal:${exhibit.contentUrl}`;
  return `${exhibit.type}:${exhibit.title}`;
}

/* API 전시관 데이터(hall)에 시드 데이터를 병합. API에 없는 전시물은 fallback ID로 대체 */
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

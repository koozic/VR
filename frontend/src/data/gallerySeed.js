/* shared/gallery-seed.json을 불러와 fallback 데이터를 제공하고, API 응답과 병합 */
import gallerySeed from '../../../shared/gallery-seed.json';
import { getHallKind } from './hallIdentity.js';

export const fallbackHalls = Object.fromEntries(
  gallerySeed.halls.map((hall) => [hall.id, hall]),
);

export const mainGalleryExhibits = fallbackHalls[1].exhibits;

const fallbackHallsByKind = Object.fromEntries(
  gallerySeed.halls
    .map((hall) => [getHallKind(hall), hall])
    .filter(([kind]) => kind),
);

export function getFallbackHall(hall) {
  return fallbackHalls[Number(hall?.id)] || fallbackHallsByKind[getHallKind(hall)] || null;
}

function exhibitKey(exhibit) {
  if (exhibit.type === 'portal') return `portal:${exhibit.title || exhibit.targetHallKey || exhibit.contentUrl}`;
  if (exhibit.contentUrl) return `${exhibit.type}:content:${exhibit.contentUrl}`;
  if (exhibit.thumbnailUrl) return `${exhibit.type}:thumbnail:${exhibit.thumbnailUrl}`;
  return `${exhibit.type}:title:${exhibit.title}`;
}

function definedEntries(object) {
  return Object.fromEntries(
    Object.entries(object || {}).filter(([, value]) => value !== null && value !== undefined),
  );
}

/* API 전시관 데이터(hall)에 시드 데이터를 병합. API에 없는 전시물은 fallback ID로 대체 */
export function mergeHallWithSeed(hall) {
  const fallbackHall = getFallbackHall(hall);
  if (!fallbackHall) return hall;

  const apiExhibits = hall.exhibits || [];
  const apiByKey = new Map(apiExhibits.map((exhibit) => [exhibitKey(exhibit), exhibit]));
  const matchedKeys = new Set();

  const exhibits = fallbackHall.exhibits.map((seedExhibit) => {
    const apiExhibit = apiByKey.get(exhibitKey(seedExhibit));
    if (!apiExhibit) return { ...seedExhibit, id: `fallback-${seedExhibit.id}` };
    matchedKeys.add(exhibitKey(seedExhibit));

    return {
      ...seedExhibit,
      ...definedEntries(apiExhibit),
      id: apiExhibit.id,
    };
  });

  const extraApiExhibits = apiExhibits.filter((exhibit) => !matchedKeys.has(exhibitKey(exhibit)));

  return {
    ...fallbackHall,
    ...hall,
    key: hall.key || fallbackHall.key,
    exhibits: [...exhibits, ...extraApiExhibits],
  };
}

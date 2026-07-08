/* shared/gallery-seed.json을 불러와 fallback 데이터를 제공하고, API 응답과 병합 */
import gallerySeed from '../../../shared/gallery-seed.json';
<<<<<<< HEAD
import { getHallKind } from './hallIdentity.js';
=======
import docentContexts from '../../../shared/docent-context.json';

function withResolvedDocentContext(exhibit) {
  if (exhibit.docentContext || !exhibit.docentSlug) return exhibit;
  const context = docentContexts[exhibit.docentSlug];
  if (!context) return exhibit;
  return {
    ...exhibit,
    docentContext: JSON.stringify(context),
  };
}

const resolvedGallerySeed = {
  ...gallerySeed,
  halls: gallerySeed.halls.map((hall) => ({
    ...hall,
    exhibits: hall.exhibits.map(withResolvedDocentContext),
  })),
};
>>>>>>> 1c2af28967e43852248526c8bdad8986666aa1ab

export const fallbackHalls = Object.fromEntries(
  resolvedGallerySeed.halls.map((hall) => [hall.id, hall]),
);

const fallbackHallsByName = Object.fromEntries(
  resolvedGallerySeed.halls.map((hall) => [hall.name, hall]),
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
<<<<<<< HEAD
  if (exhibit.type === 'portal') return `portal:${exhibit.title || exhibit.targetHallKey || exhibit.contentUrl}`;
=======
  if (exhibit.type === 'portal') return `portal:${exhibit.title}`;
>>>>>>> 1c2af28967e43852248526c8bdad8986666aa1ab
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
<<<<<<< HEAD
  const fallbackHall = getFallbackHall(hall);
=======
  const fallbackHall = fallbackHalls[Number(hall.id)] || fallbackHallsByName[hall.name];
>>>>>>> 1c2af28967e43852248526c8bdad8986666aa1ab
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
<<<<<<< HEAD
    key: hall.key || fallbackHall.key,
=======
    seedId: fallbackHall.id,
>>>>>>> 1c2af28967e43852248526c8bdad8986666aa1ab
    exhibits: [...exhibits, ...extraApiExhibits],
  };
}

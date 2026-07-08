import gallerySeed from '../../../shared/gallery-seed.json';
import docentContexts from '../../../shared/docent-context.json';
import { getHallKind } from './hallIdentity.js';

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

export const fallbackHalls = Object.fromEntries(
  resolvedGallerySeed.halls.map((hall) => [hall.id, hall]),
);

const fallbackHallsByName = Object.fromEntries(
  resolvedGallerySeed.halls.map((hall) => [hall.name, hall]),
);

export const mainGalleryExhibits = fallbackHalls[1].exhibits;

const fallbackHallsByKind = Object.fromEntries(
  resolvedGallerySeed.halls
    .map((hall) => [getHallKind(hall), hall])
    .filter(([kind]) => kind),
);

export function getFallbackHall(hall) {
  return (
    fallbackHalls[Number(hall?.seedId || hall?.id)] ||
    fallbackHallsByKind[getHallKind(hall)] ||
    fallbackHallsByName[hall?.name] ||
    null
  );
}

function exhibitKey(exhibit) {
  if (exhibit.type === 'portal') {
    return `portal:${exhibit.title || exhibit.targetHallKey || exhibit.contentUrl}`;
  }
  if (exhibit.contentUrl) return `${exhibit.type}:content:${exhibit.contentUrl}`;
  if (exhibit.thumbnailUrl) return `${exhibit.type}:thumbnail:${exhibit.thumbnailUrl}`;
  return `${exhibit.type}:title:${exhibit.title}`;
}

function normalizedText(value) {
  return String(value || '').trim().toLowerCase();
}

function sameText(left, right) {
  const normalizedLeft = normalizedText(left);
  const normalizedRight = normalizedText(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function closeNumber(left, right, tolerance = 0.05) {
  if (left == null || right == null) return false;
  return Math.abs(Number(left) - Number(right)) <= tolerance;
}

function samePlacement(left, right) {
  return (
    closeNumber(left.positionX, right.positionX) &&
    closeNumber(left.positionZ, right.positionZ) &&
    (left.positionY == null || right.positionY == null || closeNumber(left.positionY, right.positionY))
  );
}

function findSeedExhibit(apiExhibit, seedExhibits, usedSeedExhibits) {
  const availableSeeds = seedExhibits.filter((seedExhibit) => !usedSeedExhibits.has(seedExhibit));

  return (
    availableSeeds.find((seedExhibit) => exhibitKey(seedExhibit) === exhibitKey(apiExhibit)) ||
    availableSeeds.find((seedExhibit) => sameText(seedExhibit.title, apiExhibit.title)) ||
    availableSeeds.find((seedExhibit) => samePlacement(seedExhibit, apiExhibit)) ||
    null
  );
}

function definedEntries(object) {
  return Object.fromEntries(
    Object.entries(object || {}).filter(([, value]) => value !== null && value !== undefined),
  );
}

export function mergeHallWithSeed(hall) {
  const fallbackHall = getFallbackHall(hall);
  if (!fallbackHall) return hall;

  const apiExhibits = hall.exhibits || [];
  const seedExhibits = fallbackHall.exhibits || [];

  const usedSeedExhibits = new Set();
  const exhibits = apiExhibits.length > 0
    ? apiExhibits.map((apiExhibit) => {
        const seedExhibit = findSeedExhibit(apiExhibit, seedExhibits, usedSeedExhibits);
        if (!seedExhibit) return apiExhibit;
        usedSeedExhibits.add(seedExhibit);

        return {
          ...seedExhibit,
          ...definedEntries(apiExhibit),
          id: apiExhibit.id,
        };
      })
    : seedExhibits.map((seedExhibit) => ({ ...seedExhibit, id: `fallback-${seedExhibit.id}` }));

  return {
    ...fallbackHall,
    ...hall,
    key: hall.key || fallbackHall.key,
    seedId: fallbackHall.id,
    exhibits,
  };
}

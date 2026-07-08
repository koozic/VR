import { createRetroCabinet } from './createRetroCabinet.js';
import { createRetroDecor } from './createRetroDecor.js';
import { createRetroWallArt } from './createRetroWallArt.js';
import { retroGameModels, retroCabinetPositions } from './retroGameDescriptions.js';

function matchPostersToUniqueCabinets(posters, cabinets) {
  if (posters.length === 0 || cabinets.length === 0) return [];

  let bestAssignment = [];
  let bestDistance = Number.POSITIVE_INFINITY;

  function search(posterIndex, usedCabinets, assignment, totalDistance) {
    if (totalDistance >= bestDistance) return;
    if (posterIndex === posters.length) {
      bestDistance = totalDistance;
      bestAssignment = [...assignment];
      return;
    }

    cabinets.forEach((cabinet, cabinetIndex) => {
      if (usedCabinets.has(cabinetIndex)) return;

      usedCabinets.add(cabinetIndex);
      assignment.push(cabinetIndex);
      search(
        posterIndex + 1,
        usedCabinets,
        assignment,
        totalDistance + posters[posterIndex].position.distanceToSquared(cabinet.position),
      );
      assignment.pop();
      usedCabinets.delete(cabinetIndex);
    });
  }

  search(0, new Set(), [], 0);
  return bestAssignment;
}

export function createRetroGalleryContent(scene, roomY = 0) {
  const models = retroGameModels.map((game, index) => {
    const pos = retroCabinetPositions[index] || { x: 0, z: 0, yaw: 0 };
    const cabinet = createRetroCabinet(game);
    cabinet.position.set(pos.x, 0, pos.z);
    cabinet.rotation.y = pos.yaw;
    return cabinet;
  });

  models.forEach((model) => scene.add(model));
  const decor = createRetroWallArt(scene, roomY);
  const floorDecor = createRetroDecor(roomY);
  scene.add(floorDecor);

  const cabinetFrames = models.map((model, index) => ({
    exhibit: {
      ...retroGameModels[index],
      id: `model-${retroGameModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  const posters = decor.userData.posterFrames || [];
  const posterAssignments = matchPostersToUniqueCabinets(posters, models);
  const posterFrames = posters.map((poster, posterIndex) => {
    const nearestIndex = posterAssignments[posterIndex] ?? 0;

    return {
      exhibit: {
        ...retroGameModels[nearestIndex],
        id: `model-${retroGameModels[nearestIndex].id}`,
      },
      object: poster.object,
      position: poster.position.clone(),
    };
  });

  return {
    models: [...models, decor, floorDecor],
    frames: [...cabinetFrames, ...posterFrames],
  };
}

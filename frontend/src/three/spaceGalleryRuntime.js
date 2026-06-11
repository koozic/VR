import { createSolarSystem } from './createSolarSystem.js';
import { createSpaceShuttle } from './createSpaceShuttle.js';
import { createAstronaut } from './createAstronaut.js';
import { createGeminiSpacesuit } from './createGeminiSpacesuit.js';
import { createMarsRover } from './createMarsRover.js';
import { createRocket } from './createRocket.js';
import { createSatellite } from './createSatellite.js';
import { createUFO } from './createUFO.js';
import { createBlackHole } from './createBlackHole.js';
import { spaceGalleryModels } from './spaceGalleryDescriptions.js';

export function createSpaceGalleryContent(scene) {
  const models = [
    createSolarSystem(),
    createSpaceShuttle(),
    createAstronaut(),
    createGeminiSpacesuit(),
    createMarsRover(),
    createRocket(),
    createSatellite(),
    createUFO(),
    createBlackHole(),
  ];
  const metadataIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  models.forEach((model) => scene.add(model));

  const frames = models.map((model, index) => ({
    exhibit: {
      ...spaceGalleryModels[metadataIndexes[index]],
      id: `model-${spaceGalleryModels[metadataIndexes[index]].id}`,
    },
    position: model.position.clone(),
  }));

  return { models, frames };
}

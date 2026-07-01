import { createRetroCabinet } from './createRetroCabinet.js';
import { createRetroWallArt } from './createRetroWallArt.js';
import { retroGameModels, retroCabinetPositions } from './retroGameDescriptions.js';

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

  const frames = models.map((model, index) => ({
    exhibit: {
      ...retroGameModels[index],
      id: `model-${retroGameModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  return { models: [...models, decor], frames };
}

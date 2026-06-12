import { createRetroCabinet } from './createRetroCabinet.js';
import { retroGameModels, retroCabinetPositions } from './retroGameDescriptions.js';

export function createRetroGalleryContent(scene) {
  const models = retroGameModels.map((game, index) => {
    const pos = retroCabinetPositions[index] || { x: 0, z: 0, yaw: 0 };
    const cabinet = createRetroCabinet(game);
    cabinet.position.set(pos.x, 0, pos.z);
    cabinet.rotation.y = pos.yaw;
    return cabinet;
  });

  models.forEach((model) => scene.add(model));

  const frames = models.map((model, index) => ({
    exhibit: {
      ...retroGameModels[index],
      id: `model-${retroGameModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  return { models, frames };
}

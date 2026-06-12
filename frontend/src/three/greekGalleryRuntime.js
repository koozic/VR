import * as THREE from 'three';
import { createGreekSculpture } from './createGreekSculpture.js';
import { greekSculptureModels } from './greekSculptureDescriptions.js';

const STATUE_POSITIONS = [
  new THREE.Vector3(-6.5, 0, -7.0),
  new THREE.Vector3(6.5, 0, -7.0),
  new THREE.Vector3(0.0, 0, 0.0),
  new THREE.Vector3(-6.5, 0, 7.0),
  new THREE.Vector3(6.5, 0, 7.0),
];

const STATUE_OPTIONS = [
  { pedestalDiameter: 1.5, loadDelay: 0 },
  { noPedestal: true, scale: 1.5, loadDelay: 300 },
  { noPedestal: true, yaw: -Math.PI / 2, pedestalDiameter: 1.5, loadDelay: 600 },
  { pedestalDiameter: 1.5, loadDelay: 900 },
  { pedestalDiameter: 1.5, loadDelay: 1200 },
];

export function createGreekGalleryContent(scene) {
  const models = greekSculptureModels.map((model, index) => {
    const position = STATUE_POSITIONS[index] || new THREE.Vector3(0, 0, 0);
    return createGreekSculpture(
      model.id,
      position,
      STATUE_OPTIONS[index] || { pedestalDiameter: 1.5 },
    );
  });

  models.forEach((model) => scene.add(model));

  const frames = models.map((model, index) => ({
    exhibit: {
      ...greekSculptureModels[index],
      id: `model-${greekSculptureModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  return { models, frames };
}

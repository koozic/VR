import * as THREE from "three";

const SATELLITE_POSITION = new THREE.Vector3(-6.0, 0, -6.0);

function createPedestal() {
  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.46, 0.14, 32),
    new THREE.MeshStandardMaterial({
      color: 0x222d39,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0c1725,
      emissiveIntensity: 0.48,
    }),
  );
  base.position.y = 0.07;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.018, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0x82a9ce }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.15;
  pedestal.add(rim);
  return pedestal;
}

export function createSatellite() {
  const exhibit = new THREE.Group();
  exhibit.name = "satellite-exhibit";
  exhibit.position.copy(SATELLITE_POSITION);
  exhibit.rotation.y = Math.atan2(-SATELLITE_POSITION.x, -SATELLITE_POSITION.z);

  exhibit.add(createPedestal());

  const mount = new THREE.Group();
  mount.position.y = 1.18;
  exhibit.add(mount);

  const keyLight = new THREE.SpotLight(
    0xd7ebff,
    4.5,
    6,
    Math.PI / 5,
    0.52,
    1.4,
  );
  keyLight.position.set(1.0, 3.5, 1.2);
  keyLight.target.position.set(0, 1.8, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0xb6d8ff, 4, 4.5, 1.35);
  fillLight.position.set(-0.5, 2.5, -0.8);
  exhibit.add(fillLight);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xc0c8d0,
    roughness: 0.35,
    metalness: 0.6,
    emissive: 0x182838,
    emissiveIntensity: 0.18,
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a4a,
    roughness: 0.5,
    metalness: 0.3,
    emissive: 0x0a1a3a,
    emissiveIntensity: 0.2,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a850,
    roughness: 0.4,
    metalness: 0.3,
    emissive: 0x3a2810,
    emissiveIntensity: 0.12,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.5), bodyMat);
  body.position.y = 0.6;
  mount.add(body);

  const panelGroup = new THREE.Group();
  panelGroup.position.y = 0.6;

  const panelPositions = [
    { x: 0.65, z: 0, ry: 0 },
    { x: -0.65, z: 0, ry: 0 },
    { x: 0, z: 0.65, ry: Math.PI / 2 },
    { x: 0, z: -0.65, ry: Math.PI / 2 },
  ];

  panelPositions.forEach(({ x, z, ry }) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.03, 0.03),
      bodyMat,
    );
    arm.position.set(x * 0.55, 0, z * 0.55);
    arm.rotation.y = ry;
    panelGroup.add(arm);

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.4, 0.025),
      panelMat,
    );
    panel.position.set(x * 1.05, 0, z * 1.05);
    panel.rotation.y = ry;
    panelGroup.add(panel);

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x4a6a8a,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.38), gridMat);
    grid.position.set(x * 1.05, 0, z * 1.05);
    grid.rotation.y = ry;
    panelGroup.add(grid);
  });

  mount.add(panelGroup);

  const dishMount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.15, 8),
    bodyMat,
  );
  dishMount.position.set(0, 0.95, -0.15);
  mount.add(dishMount);

  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.05, 0.06, 16),
    goldMat,
  );
  dish.position.set(0, 1.02, -0.15);
  dish.rotation.x = 0.2;
  mount.add(dish);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.25, 4),
    bodyMat,
  );
  antenna.position.set(0, 0.95, -0.28);
  antenna.rotation.x = 0.3;
  mount.add(antenna);

  const sensorMat = new THREE.MeshStandardMaterial({
    color: 0x222a38,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x334466,
    emissiveIntensity: 0.25,
  });
  const sensor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.08, 12),
    sensorMat,
  );
  sensor.position.set(0.1, 0.87, 0.12);
  mount.add(sensor);

  const sensor2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.06, 12),
    sensorMat,
  );
  sensor2.position.set(-0.1, 0.87, 0.12);
  mount.add(sensor2);

  exhibit.userData.update = (elapsed) => {
    panelGroup.rotation.y += 0.005;
    mount.position.y = 0.18 + Math.sin(elapsed * 0.5) * 0.015;
  };

  return exhibit;
}

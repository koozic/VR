import * as THREE from "three";

const ROVER_POSITION = new THREE.Vector3(-3.0, 0, 9.0);

function createPedestal() {
  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.24, 0.22, 40),
    new THREE.MeshStandardMaterial({
      color: 0x222d39,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0c1725,
      emissiveIntensity: 0.48,
    }),
  );
  base.position.y = 0.11;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.14, 0.025, 12, 48),
    new THREE.MeshBasicMaterial({ color: 0x82a9ce }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.23;
  pedestal.add(rim);
  return pedestal;
}

function createWheel(x, z) {
  const group = new THREE.Group();

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
    new THREE.MeshStandardMaterial({
      color: 0x606870,
      roughness: 0.7,
      metalness: 0.4,
      emissive: 0x182028,
      emissiveIntensity: 0.12,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.085, 0.015, 8, 16),
    new THREE.MeshStandardMaterial({
      color: 0x404850,
      roughness: 0.9,
      emissive: 0x101520,
      emissiveIntensity: 0.1,
    }),
  );
  tire.rotation.x = Math.PI / 2;
  group.add(tire);

  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.06, 4),
      new THREE.MeshStandardMaterial({
        color: 0x808890,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x202830,
        emissiveIntensity: 0.08,
      }),
    );
    spoke.position.set(Math.cos(angle) * 0.04, Math.sin(angle) * 0.04, 0);
    spoke.rotation.z = -angle;
    group.add(spoke);
  }

  group.position.set(x, 0.06, z);
  return group;
}

export function createMarsRover() {
  const exhibit = new THREE.Group();
  exhibit.name = "mars-rover-exhibit";
  exhibit.position.copy(ROVER_POSITION);
  exhibit.rotation.y = Math.atan2(-ROVER_POSITION.x, -ROVER_POSITION.z);

  exhibit.add(createPedestal());

  const mount = new THREE.Group();
  mount.position.y = 0.22;
  mount.scale.setScalar(2.5);
  exhibit.add(mount);

  const keyLight = new THREE.SpotLight(0xd7ebff, 8, 10, Math.PI / 5, 0.5, 1.4);
  keyLight.position.set(1.8, 4.0, 2.2);
  keyLight.target.position.set(0, 1.2, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0xb6d8ff, 6, 8, 1.35);
  fillLight.position.set(-1.0, 2.5, -1.5);
  exhibit.add(fillLight);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xc8b888,
    roughness: 0.6,
    metalness: 0.15,
    emissive: 0x2a2218,
    emissiveIntensity: 0.15,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x404850,
    roughness: 0.7,
    metalness: 0.2,
    emissive: 0x182028,
    emissiveIntensity: 0.12,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a850,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0x3a2810,
    emissiveIntensity: 0.1,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.35), bodyMat);
  body.position.y = 0.2;
  mount.add(body);

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.04, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0x9098a0,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0x202830,
      emissiveIntensity: 0.1,
    }),
  );
  deck.position.y = 0.32;
  mount.add(deck);

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a4a,
    roughness: 0.4,
    metalness: 0.3,
    emissive: 0x0a1a3a,
    emissiveIntensity: 0.15,
  });
  const solarPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.02, 0.32),
    panelMat,
  );
  solarPanel.position.set(0, 0.38, 0);
  mount.add(solarPanel);

  const panelGrid = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.28),
    new THREE.MeshBasicMaterial({
      color: 0x2a4a7a,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    }),
  );
  panelGrid.position.set(0, 0.39, 0);
  panelGrid.rotation.x = -Math.PI / 2;
  mount.add(panelGrid);

  const mastBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8),
    darkMat,
  );
  mastBase.position.set(0.05, 0.5, 0.05);
  mount.add(mastBase);

  const mastHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x606870,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0x202830,
      emissiveIntensity: 0.1,
    }),
  );
  mastHead.position.set(0.05, 0.66, 0.05);
  mount.add(mastHead);

  const cameraL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.02, 8),
    new THREE.MeshStandardMaterial({
      color: 0x202838,
      emissive: 0x4466aa,
      emissiveIntensity: 0.2,
    }),
  );
  cameraL.position.set(0.03, 0.69, 0.05);
  cameraL.rotation.x = Math.PI / 2;
  mount.add(cameraL);

  const cameraR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.02, 8),
    new THREE.MeshStandardMaterial({
      color: 0x202838,
      emissive: 0x4466aa,
      emissiveIntensity: 0.2,
    }),
  );
  cameraR.position.set(0.07, 0.69, 0.05);
  cameraR.rotation.x = Math.PI / 2;
  mount.add(cameraR);

  const armGroup = new THREE.Group();
  armGroup.position.set(-0.2, 0.22, 0.12);

  const armSeg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.01, 0.12, 6),
    bodyMat,
  );
  armSeg1.position.set(0, 0.06, 0);
  armSeg1.rotation.x = 0.3;
  armGroup.add(armSeg1);

  const armSeg2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.008, 0.1, 6),
    bodyMat,
  );
  armSeg2.position.set(-0.04, 0.13, -0.02);
  armSeg2.rotation.x = -0.2;
  armSeg2.rotation.z = 0.4;
  armGroup.add(armSeg2);

  const scoop = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.01, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0x707880,
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x202830,
      emissiveIntensity: 0.08,
    }),
  );
  scoop.position.set(-0.08, 0.17, -0.03);
  armGroup.add(scoop);

  mount.add(armGroup);

  const wheelPositions = [
    [-0.17, 0.18],
    [-0.17, 0],
    [-0.17, -0.18],
    [0.17, 0.18],
    [0.17, 0],
    [0.17, -0.18],
  ];

  wheelPositions.forEach(([x, z]) => {
    mount.add(createWheel(x, z));
  });

  const rockerBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.005, 0.2),
    darkMat,
  );
  rockerBar.position.set(-0.17, 0.04, 0);
  mount.add(rockerBar);

  const rockerBarR = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.005, 0.2),
    darkMat,
  );
  rockerBarR.position.set(0.17, 0.04, 0);
  mount.add(rockerBarR);

  const antennaDish = new THREE.Mesh(
    new THREE.CircleGeometry(0.05, 12),
    goldMat,
  );
  antennaDish.position.set(0, 0.42, -0.15);
  antennaDish.rotation.x = 0.4;
  mount.add(antennaDish);

  const antennaStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.002, 0.08, 4),
    darkMat,
  );
  antennaStick.position.set(0, 0.38, -0.14);
  antennaStick.rotation.x = 0.4;
  mount.add(antennaStick);

  exhibit.userData.update = (elapsed) => {
    mount.position.y = 0.22 + Math.sin(elapsed * 0.5 + 0.8) * 0.018;
    mastHead.rotation.y = Math.sin(elapsed * 0.3) * 0.08;
    armGroup.rotation.z = Math.sin(elapsed * 0.2) * 0.05;
  };

  return exhibit;
}

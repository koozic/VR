/* 3D 태양계 전시물. 8개 행성 공전/자전 + 별자리 + 태양광원 */
import * as THREE from 'three';

const ASSET_ROOT = '/assets/solar-system';

const PLANETS = [
  { name: 'Mercury', radius: 10, size: 0.2, orbitSpeed: 0.48, rotationSpeed: 0.5, texture: 'mercury-map.jpg', rim: 0xf9cf9f },
  { name: 'Venus', radius: 13, size: 0.5, orbitSpeed: 0.35, rotationSpeed: -0.05, texture: 'venus-map.jpg', rim: 0xb66f1f },
  { name: 'Earth', radius: 16, size: 0.5, orbitSpeed: 0.29, rotationSpeed: 1, texture: 'earth-map-1.jpg', rim: 0x4b9ee8, earth: true },
  { name: 'Mars', radius: 19, size: 0.3, orbitSpeed: 0.24, rotationSpeed: 1, texture: 'mars-map.jpg', rim: 0xbc6434 },
  { name: 'Jupiter', radius: 22, size: 1, orbitSpeed: 0.13, rotationSpeed: 2.4, texture: 'jupiter-map.jpg', rim: 0xf3d6b6 },
  { name: 'Saturn', radius: 25, size: 0.8, orbitSpeed: 0.1, rotationSpeed: 2, texture: 'saturn-map.jpg', rim: 0xd6b892, rings: ['saturn-rings.jpg', 0.65] },
  { name: 'Uranus', radius: 28, size: 0.5, orbitSpeed: 0.07, rotationSpeed: -1, texture: 'uranus-map.jpg', rim: 0x9ab6c2, rings: ['uranus-rings.jpg', 0.55] },
  { name: 'Neptune', radius: 31, size: 0.5, orbitSpeed: 0.054, rotationSpeed: 1, texture: 'neptune-map.jpg', rim: 0x5c7ed7 },
];

function loadTexture(loader, filename, colorSpace = THREE.SRGBColorSpace) {
  const texture = loader.load(`${ASSET_ROOT}/${filename}`);
  texture.colorSpace = colorSpace;
  return texture;
}

function createOrbit(radius) {
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.025, radius + 0.025, 128),
    new THREE.MeshBasicMaterial({
      color: 0x9ec8e8,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    }),
  );
  orbit.rotation.x = -Math.PI / 2;
  return orbit;
}

function createGlow(size, color, opacity = 0.2) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(size, 36, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
}

function createPlanet(loader, config, index) {
  const orbitGroup = new THREE.Group();
  orbitGroup.name = `${config.name}-orbit`;
  orbitGroup.rotation.y = index * 0.72;
  orbitGroup.add(createOrbit(config.radius));

  const planetGroup = new THREE.Group();
  planetGroup.name = config.name;
  planetGroup.position.x = config.radius;
  planetGroup.rotation.z = config.earth ? THREE.MathUtils.degToRad(-23.4) : 0;

  const geometry = new THREE.SphereGeometry(config.size, 48, 32);
  const planet = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({ map: loadTexture(loader, config.texture) }),
  );
  planetGroup.add(planet);

  const glow = createGlow(config.size * 1.14, config.rim, 0.18);
  planetGroup.add(glow);

  if (config.earth) {
    planetGroup.add(new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        map: loadTexture(loader, 'earth-map-2.jpg'),
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
      }),
    ));

    const clouds = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        map: loadTexture(loader, 'earth-map-3.jpg'),
        alphaMap: loadTexture(loader, 'earth-map-4.jpg', THREE.NoColorSpace),
        transparent: true,
        opacity: 0.72,
      }),
    );
    clouds.scale.setScalar(1.015);
    planetGroup.add(clouds);
  }

  if (config.rings) {
    const [ringsTexture, ringsSize] = config.rings;
    const rings = new THREE.Mesh(
      new THREE.RingGeometry(config.size + 0.12, config.size + ringsSize, 64),
      new THREE.MeshBasicMaterial({
        map: loadTexture(loader, ringsTexture),
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      }),
    );
    rings.rotation.x = -Math.PI / 2;
    planetGroup.add(rings);
  }

  orbitGroup.add(planetGroup);
  return { orbitGroup, planetGroup, config };
}

function createSun(loader) {
  const sun = new THREE.Group();
  const geometry = new THREE.SphereGeometry(5, 64, 40);
  sun.add(new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: loadTexture(loader, 'sun-map.jpg') }),
  ));

  const corona = createGlow(5.34, 0xff6b18, 0.28);
  corona.name = 'sun-corona';
  sun.add(corona);

  const light = new THREE.PointLight(0xffa342, 3.4, 15, 1.8);
  sun.add(light);
  return { sun, corona };
}

function createStarfield(loader) {
  const positions = [];
  const colors = [];
  const color = new THREE.Color();

  for (let index = 0; index < 620; index += 1) {
    const radius = THREE.MathUtils.randFloat(25, 47);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
    );
    color.setHSL(THREE.MathUtils.randFloat(0.55, 0.68), 0.55, THREE.MathUtils.randFloat(0.58, 1));
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: loadTexture(loader, 'circle.png'),
      size: 0.14,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
}

// Adapted for the gallery from cookieMonsterDev/solar-system-threejs.
export function createSolarSystem() {
  const loader = new THREE.TextureLoader();
  const system = new THREE.Group();
  system.name = 'space-gallery-solar-system';
  system.position.set(0, 2.15, 0);
  system.scale.setScalar(0.245);

  const { sun, corona } = createSun(loader);
  const starfield = createStarfield(loader);
  const planets = PLANETS.map((config, index) => createPlanet(loader, config, index));

  system.add(starfield, sun, ...planets.map(({ orbitGroup }) => orbitGroup));
  system.userData.collisionRadius = 1.3; // 충돌 감지용 반지름

  system.userData.update = (elapsed, delta) => {
    sun.rotation.y -= delta * 0.18;
    corona.scale.setScalar(1 + Math.sin(elapsed * 2.1) * 0.025);
    starfield.rotation.y += delta * 0.012;

    planets.forEach(({ orbitGroup, planetGroup, config }) => {
      orbitGroup.rotation.y -= delta * config.orbitSpeed;
      planetGroup.rotation.y += delta * config.rotationSpeed;
    });
  };

  return system;
}

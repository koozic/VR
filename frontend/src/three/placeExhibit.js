/* 네 면의 벽면 좌표. 작품을 벽에 걸 때 기준이 됨 */
const WALL_PLACEMENTS = [
  { axis: 'z', value: -10.82, rotationY: 0 },
  { axis: 'x', value: -8.82, rotationY: Math.PI / 2 },
  { axis: 'x', value: 8.82, rotationY: -Math.PI / 2 },
  { axis: 'z', value: 10.82, rotationY: Math.PI },
];

/* 전시품 위치 정보(positionX/Y/Z)를 받아 3D 공간 좌표로 변환.
   snapToWall=true면 가장 가까운 벽면에 딱 붙임 (포탈이 아닌 일반 작품) */
export function placeExhibitOnWall(exhibit, { snapToWall = false } = {}) {
  let x = exhibit.positionX ?? 0;
  const y = exhibit.positionY ?? 2;
  let z = exhibit.positionZ ?? -10.82;

  const nearestWall = WALL_PLACEMENTS.reduce((nearest, wall) => {
    const distance = Math.abs((wall.axis === 'x' ? x : z) - wall.value);
    return distance < nearest.distance ? { wall, distance } : nearest;
  }, { wall: null, distance: Infinity });

  const indexedWall = WALL_PLACEMENTS[exhibit.wallIndex];
  const wall = nearestWall.distance <= 2 ? nearestWall.wall : indexedWall;
  const rotationY = wall?.rotationY ?? exhibit.rotationY ?? 0;

  if (snapToWall && wall) {
    if (wall.axis === 'x') x = wall.value;
    if (wall.axis === 'z') z = wall.value;
  }

  return { x, y, z, rotationY };
}

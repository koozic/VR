import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D 전시관 내 유저 이동 및 시야 회전을 관리하는 커스텀 훅
 * @param {Object} params 
 * @param {HTMLElement} params.domElement - 이벤트 리스너를 등록할 DOM 요소 (렌더러 캔버스)
 * @param {Function} params.onLocalPoseChange - 위치/회전 변경 시 호출될 콜백
 */
export function useGalleryMovement({
  domElement,
  onLocalPoseChange,
}) {
  // 입력 상태 관리 (키보드)
  const pressedKeys = useRef(new Set());
  // 시야 회전 값 (라디안)
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  // 이동 속도
  const velocity = useRef(new THREE.Vector3());
  
  // 콜백 함수를 ref로 관리하여 훅의 안정성 확보
  const onLocalPoseChangeRef = useRef(onLocalPoseChange);
  useEffect(() => {
    onLocalPoseChangeRef.current = onLocalPoseChange;
  }, [onLocalPoseChange]);

  // 계산용 임시 벡터 (메모리 할당 최적화)
  const _forward = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);

  /**
   * 위치와 회전을 특정 값으로 초기화 (방 이동 시 사용)
   */
  const reset = (x, z, yaw, camera) => {
    yawRef.current = yaw || 0;
    pitchRef.current = 0;
    velocity.current.set(0, 0, 0);
    if (camera) {
      camera.position.x = x || 0;
      camera.position.z = z || 0;
    }
  };

  useEffect(() => {
    if (!domElement) return;

    // 키보드 입력 핸들러
    const handleKeyDown = (event) => pressedKeys.current.add(event.key.toLowerCase());
    const handleKeyUp = (event) => pressedKeys.current.delete(event.key.toLowerCase());
    
    // 마우스 이동 시야 회전 핸들러
    const handleMouseMove = (event) => {
      if (document.pointerLockElement !== domElement) return;
      
      // 감도 조절 (0.0022)
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current -= event.movementY * 0.0022;
      
      // 수직 시야각 제한 (약 70도)
      pitchRef.current = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, pitchRef.current));
    };

    // 캔버스 클릭 시 마우스 포인터 잠금 요청
    const handleCanvasClick = () => {
      domElement.requestPointerLock();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('click', handleCanvasClick);
    };
  }, [domElement]);

  /**
   * 매 애니메이션 프레임마다 호출되어 위치와 회전을 업데이트
   * @param {number} delta - 이전 프레임과의 시간 차이 (초)
   * @param {THREE.Camera} camera - 장면의 카메라
   * @param {number} cameraY - 카메라의 고정 Y축 높이
   */
  const update = (delta, camera, cameraY = 1.6) => {
    if (!camera) return;

    // 1. 카메라 회전 적용 (YXZ 순서로 회전 적용)
    camera.quaternion.setFromEuler(
      new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ')
    );

    // 2. 키보드 입력 기반 이동 방향 계산
    const forwardInput = Number(pressedKeys.current.has('w') || pressedKeys.current.has('arrowup'))
      - Number(pressedKeys.current.has('s') || pressedKeys.current.has('arrowdown'));
    const strafeInput = Number(pressedKeys.current.has('d') || pressedKeys.current.has('arrowright'))
      - Number(pressedKeys.current.has('a') || pressedKeys.current.has('arrowleft'));

    // 3. 이동 속도 설정 (Shift 키로 달리기 처리)
    const speed = pressedKeys.current.has('shiftleft') || pressedKeys.current.has('shiftright') ? 5.4 : 3.2;

    if (forwardInput !== 0 || strafeInput !== 0) {
      // 카메라 시선 방향을 기준으로 이동 벡터 계산 (Y축 고정)
      _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      _forward.y = 0;
      _forward.normalize();
      _right.crossVectors(_forward, _up).normalize();

      velocity.current.x = _forward.x * forwardInput * speed + _right.x * strafeInput * speed;
      velocity.current.z = _forward.z * forwardInput * speed + _right.z * strafeInput * speed;
    } else {
      // 입력이 없을 때 서서히 감속 (Damping)
      velocity.current.x = THREE.MathUtils.damp(velocity.current.x, 0, 9, delta);
      velocity.current.z = THREE.MathUtils.damp(velocity.current.z, 0, 9, delta);
    }

    // 4. 위치 업데이트 및 전시관 벽 경계 제한
    camera.position.x += velocity.current.x * delta;
    camera.position.z += velocity.current.z * delta;
    camera.position.y = cameraY; // Y축 높이 유지

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8.2, 8.2);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9.8, 9.8);

    // 5. 위치 변경 사항을 외부로 전달
    onLocalPoseChangeRef.current?.({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      yaw: yawRef.current,
    });
  };

  return {
    update,
    reset,
    yawRef,
    pitchRef,
  };
}

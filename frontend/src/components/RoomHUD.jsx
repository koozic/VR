/* 3D 화면 좌상단에 전시실 이름과 가까운 작품 거리를 표시하는 HUD */
export default function RoomHUD({ roomName, exhibit, distance }) {
  return (
    <div className="room-hud">
      <div className="room-hud__name">{roomName}</div>
      {exhibit && (
        <div className="room-hud__exhibit">
          <span className="room-hud__label">가까운 작품</span>
          <span className="room-hud__title">{exhibit.title}</span>
          <span className="room-hud__distance">거리 {distance}m</span>
        </div>
      )}
    </div>
  );
}

import logging
import math
import os
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv

from app.schemas.ai_request import Coordinates

load_dotenv()

logger = logging.getLogger(__name__)


class ArtworkRepositoryConfigurationError(RuntimeError):
    """Raised when artwork DB access is not configured."""


class ArtworkRepositoryError(RuntimeError):
    """Raised when artwork DB access fails."""


@dataclass(frozen=True)
class ArtworkInfo:
    """DB 또는 요청에서 읽은 작품 정보를 서비스 계층에서 공통으로 쓰는 형태."""

    id: int
    title: str
    artist_name: str | None
    description: str | None
    pos_x: float | None = None
    pos_y: float | None = None
    pos_z: float | None = None
    distance: float | None = None


class ArtworkRepository:
    """AI 서버가 Oracle DB에서 작품과 좌표를 직접 조회할 때 사용하는 저장소."""

    def __init__(self) -> None:
        self.user = _get_env("AI_DB_USER", "DB_USER")
        self.password = _get_env("AI_DB_PASSWORD", "DB_PASSWORD")
        self.dsn = _get_env("AI_DB_DSN", "DB_DSN")

    def is_configured(self) -> bool:
        """DB 접속에 필요한 세 환경 변수가 모두 있는지 확인한다."""
        return bool(self.user and self.password and self.dsn)

    def find_nearest(
        self,
        user_position: Coordinates,
        hall_id: int | None = None,
    ) -> ArtworkInfo | None:
        """사용자 좌표와 가장 가까운 작품 한 건을 찾는다."""
        self._ensure_configured()
        hall_filter = "WHERE e.hall_id = :hall_id" if hall_id is not None else ""
        # 3차원 거리 공식에서 제곱근은 정렬 순서에 영향을 주지 않으므로
        # SQL에서는 거리의 제곱만 계산하고 가장 작은 행 하나를 선택한다.
        sql = """
            SELECT id, title, creator, description, pos_x, pos_y, pos_z, distance_squared
            FROM (
                SELECT
                    e.id,
                    e.title,
                    e.creator,
                    e.description,
                    p.pos_x,
                    p.pos_y,
                    p.pos_z,
                    (
                        (p.pos_x - :user_x) * (p.pos_x - :user_x)
                        + (p.pos_y - :user_y) * (p.pos_y - :user_y)
                        + (p.pos_z - :user_z) * (p.pos_z - :user_z)
                    ) AS distance_squared
                FROM exhibits e
                JOIN exhibit_positions p ON p.exhibit_id = e.id
                {hall_filter}
                ORDER BY distance_squared ASC
            )
            WHERE ROWNUM = 1
        """.format(hall_filter=hall_filter)
        params = {
            "user_x": user_position.x,
            "user_y": user_position.y,
            "user_z": user_position.z,
        }
        if hall_id is not None:
            params["hall_id"] = hall_id

        row = self._fetch_one(sql, params)
        return _row_to_artwork(row, has_distance=True) if row else None

    def find_by_id(self, artwork_id: int) -> ArtworkInfo | None:
        """작품 ID로 기본 정보와 위치를 함께 조회한다."""
        self._ensure_configured()
        sql = """
            SELECT
                e.id,
                e.title,
                e.creator,
                e.description,
                p.pos_x,
                p.pos_y,
                p.pos_z
            FROM exhibits e
            LEFT JOIN exhibit_positions p ON p.exhibit_id = e.id
            WHERE e.id = :artwork_id
        """
        row = self._fetch_one(sql, {"artwork_id": artwork_id})
        return _row_to_artwork(row, has_distance=False) if row else None

    def _ensure_configured(self) -> None:
        if not self.is_configured():
            raise ArtworkRepositoryConfigurationError(
                "AI_DB_USER, AI_DB_PASSWORD, and AI_DB_DSN must be configured."
            )

    def _fetch_one(self, sql: str, params: dict[str, Any]) -> tuple[Any, ...] | None:
        """Oracle 연결을 열어 SQL을 실행하고 첫 번째 행만 반환한다."""
        try:
            import oracledb
        except ModuleNotFoundError as exc:
            raise ArtworkRepositoryConfigurationError(
                "The oracledb package is required for DB-backed artwork lookup."
            ) from exc

        try:
            with oracledb.connect(user=self.user, password=self.password, dsn=self.dsn) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(sql, params)
                    row = cursor.fetchone()
                    return tuple(_read_lob(value) for value in row) if row else None
        except Exception as exc:
            logger.exception("Failed to fetch artwork from DB.")
            raise ArtworkRepositoryError("Failed to fetch artwork from DB.") from exc


def _get_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value
    return ""


def _read_lob(value: Any) -> Any:
    """Oracle CLOB 같은 LOB 객체를 일반 파이썬 값으로 변환한다."""
    if hasattr(value, "read"):
        return value.read()
    return value


def _to_float(value: Any) -> float | None:
    value = _read_lob(value)
    if value is None:
        return None
    return float(value)


def _to_text(value: Any) -> str | None:
    value = _read_lob(value)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _row_to_artwork(row: tuple[Any, ...], has_distance: bool) -> ArtworkInfo:
    """DB 행의 열 순서를 ArtworkInfo 필드에 맞게 변환한다."""
    pos_x = _to_float(row[4])
    pos_y = _to_float(row[5])
    pos_z = _to_float(row[6])
    distance = None
    if has_distance:
        distance_squared = _to_float(row[7])
        distance = math.sqrt(distance_squared) if distance_squared is not None else None

    return ArtworkInfo(
        id=int(row[0]),
        title=_to_text(row[1]) or "Untitled",
        artist_name=_to_text(row[2]),
        description=_to_text(row[3]),
        pos_x=pos_x,
        pos_y=pos_y,
        pos_z=pos_z,
        distance=distance,
    )

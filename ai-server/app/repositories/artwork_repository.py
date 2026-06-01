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
    id: int
    title: str
    artist_name: str | None
    description: str | None
    pos_x: float | None = None
    pos_y: float | None = None
    pos_z: float | None = None
    distance: float | None = None


class ArtworkRepository:
    def __init__(self) -> None:
        self.user = _get_env("AI_DB_USER", "DB_USER")
        self.password = _get_env("AI_DB_PASSWORD", "DB_PASSWORD")
        self.dsn = _get_env("AI_DB_DSN", "DB_DSN")

    def is_configured(self) -> bool:
        return bool(self.user and self.password and self.dsn)

    def find_nearest(
        self,
        user_position: Coordinates,
        hall_id: int | None = None,
    ) -> ArtworkInfo | None:
        self._ensure_configured()
        hall_filter = "WHERE e.hall_id = :hall_id" if hall_id is not None else ""
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

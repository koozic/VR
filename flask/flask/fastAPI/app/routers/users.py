from fastapi import APIRouter
from app.schemas.user import User

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/")
async def get_users():
    return [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
    ]

@router.post("/")
async def create_user(user: User):
    return {
        "message": "User created",
        "user": user
    } 

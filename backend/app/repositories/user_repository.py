from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.scalar(select(User).where(User.id == user_id))

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email))

    def list_all_ordered(self) -> list[User]:
        return list(self.db.scalars(select(User).order_by(User.id)).all())

    def count_all(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(User)) or 0)

    def create(
        self,
        *,
        email: str,
        hashed_password: str,
        role: str,
        full_name: str,
    ) -> User:
        user = User(
            email=email,
            hashed_password=hashed_password,
            role=role,
            full_name=full_name,
        )
        self.db.add(user)
        self.db.flush()
        return user

from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.schemas import ProductResponse, StatsResponse, UserResponse


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.products = ProductRepository(db)

    def stats(self) -> StatsResponse:
        return StatsResponse(
            total_users=self.users.count_all(),
            total_products=self.products.count_all(),
        )

    def list_users(self) -> list[UserResponse]:
        return [
            UserResponse.model_validate(u) for u in self.users.list_all_ordered()
        ]

    def list_products(self) -> list[ProductResponse]:
        return [
            ProductResponse.model_validate(p)
            for p in self.products.list_ordered()
        ]

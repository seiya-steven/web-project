from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import CartItem


class CartRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_user_with_product(self, user_id: int) -> list[CartItem]:
        stmt = (
            select(CartItem)
            .where(CartItem.user_id == user_id)
            .options(joinedload(CartItem.product))
            .order_by(CartItem.id)
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_by_id_for_user(self, item_id: int, user_id: int) -> CartItem | None:
        stmt = (
            select(CartItem)
            .where(CartItem.id == item_id, CartItem.user_id == user_id)
            .options(joinedload(CartItem.product))
        )
        return self.db.scalars(stmt).unique().first()

    def get_by_user_and_product(
        self, user_id: int, product_id: int
    ) -> CartItem | None:
        return self.db.scalar(
            select(CartItem).where(
                CartItem.user_id == user_id,
                CartItem.product_id == product_id,
            )
        )

    def add_or_increment(
        self, user_id: int, product_id: int, quantity: int
    ) -> CartItem:
        existing = self.get_by_user_and_product(user_id, product_id)
        if existing:
            existing.quantity += quantity
            self.db.flush()
            stmt = (
                select(CartItem)
                .where(CartItem.id == existing.id)
                .options(joinedload(CartItem.product))
            )
            reloaded = self.db.scalars(stmt).unique().first()
            assert reloaded is not None
            return reloaded
        item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
        )
        self.db.add(item)
        self.db.flush()
        stmt = (
            select(CartItem)
            .where(CartItem.id == item.id)
            .options(joinedload(CartItem.product))
        )
        loaded = self.db.scalars(stmt).unique().first()
        assert loaded is not None
        return loaded

    def save_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        self.db.flush()
        self.db.refresh(item)
        stmt = (
            select(CartItem)
            .where(CartItem.id == item.id)
            .options(joinedload(CartItem.product))
        )
        loaded = self.db.scalars(stmt).unique().first()
        assert loaded is not None
        return loaded

    def delete(self, item: CartItem) -> None:
        self.db.delete(item)
        self.db.flush()

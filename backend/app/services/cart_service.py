from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas import CartItemCreate, CartItemResponse, CartItemUpdate


class CartService:
    def __init__(self, db: Session):
        self.db = db
        self.cart = CartRepository(db)
        self.products = ProductRepository(db)

    def list_items(self, user_id: int) -> list[CartItemResponse]:
        items = self.cart.list_for_user_with_product(user_id)
        return [CartItemResponse.model_validate(i) for i in items]

    def add_item(self, user_id: int, data: CartItemCreate) -> CartItemResponse:
        product = self.products.get_by_id(data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sản phẩm",
            )
        if product.stock < data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không đủ hàng trong kho",
            )
        existing = self.cart.get_by_user_and_product(user_id, data.product_id)
        need = data.quantity if not existing else existing.quantity + data.quantity
        if product.stock < need:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không đủ hàng trong kho",
            )
        item = self.cart.add_or_increment(user_id, data.product_id, data.quantity)
        self.db.commit()
        return CartItemResponse.model_validate(item)

    def update_item(
        self, user_id: int, item_id: int, data: CartItemUpdate
    ) -> CartItemResponse:
        item = self.cart.get_by_id_for_user(item_id, user_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy mục giỏ hàng",
            )
        product = item.product
        if product.stock < data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không đủ hàng trong kho",
            )
        item = self.cart.save_quantity(item, data.quantity)
        self.db.commit()
        return CartItemResponse.model_validate(item)

    def remove_item(self, user_id: int, item_id: int) -> None:
        item = self.cart.get_by_id_for_user(item_id, user_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy mục giỏ hàng",
            )
        self.cart.delete(item)
        self.db.commit()

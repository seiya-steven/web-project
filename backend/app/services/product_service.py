from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.schemas import ProductCreate, ProductResponse, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.products = ProductRepository(db)

    def list_products(self, category: str | None = None) -> list[ProductResponse]:
        rows = self.products.list_ordered(category=category)
        return [ProductResponse.model_validate(p) for p in rows]

    def create_product(self, data: ProductCreate) -> ProductResponse:
        product = self.products.create(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            image_url=data.image_url,
            category=data.category,
        )
        self.db.commit()
        self.db.refresh(product)
        return ProductResponse.model_validate(product)

    def update_product(self, product_id: int, data: ProductUpdate) -> ProductResponse:
        product = self.products.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sản phẩm",
            )
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return ProductResponse.model_validate(product)
        self.products.update(product, **update_data)
        self.db.commit()
        self.db.refresh(product)
        return ProductResponse.model_validate(product)

    def delete_product(self, product_id: int) -> None:
        product = self.products.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sản phẩm",
            )
        self.products.delete(product)
        self.db.commit()

    def admin_get(self, product_id: int) -> ProductResponse:
        product = self.products.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sản phẩm",
            )
        return ProductResponse.model_validate(product)

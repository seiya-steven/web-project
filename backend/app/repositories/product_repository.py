from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int) -> Product | None:
        return self.db.scalar(select(Product).where(Product.id == product_id))

    def list_ordered(self, category: str | None = None) -> list[Product]:
        stmt = select(Product).order_by(Product.id)
        if category is not None and category.strip() != "":
            stmt = stmt.where(Product.category == category.strip())
        return list(self.db.scalars(stmt).all())

    def count_all(self) -> int:
        return int(self.db.scalar(select(func.count()).select_from(Product)) or 0)

    def create(
        self,
        *,
        name: str,
        description: str | None,
        price,
        stock: int,
        image_url: str | None,
        category: str | None = None,
    ) -> Product:
        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            image_url=image_url,
            category=category,
        )
        self.db.add(product)
        self.db.flush()
        return product

    def update(self, product: Product, **fields) -> Product:
        nullable = {"description", "image_url", "category"}
        for key, value in fields.items():
            if value is not None or key in nullable:
                setattr(product, key, value)
        self.db.flush()
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.flush()

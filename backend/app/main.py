import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text

from app.database import Base, engine
from app import models as _models  # noqa: F401
from app.config import settings
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.routes import register_routers
from app.security import get_password_hash, is_bcrypt_hash

logger = logging.getLogger(__name__)


def ensure_products_category_column() -> None:
    """Bảng đã tồn tại (create_all không thêm cột mới): thêm category nếu thiếu."""
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(128)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_products_category ON products (category)"
                )
            )
    except Exception:
        logger.exception("Không thể migrate cột products.category (cần PostgreSQL)")


def _hash_seed_admin_password(plain_or_hash: str) -> str:
    """
    Seed admin: nếu .env đã đặt sẵn chuỗi bcrypt thì lưu nguyên;
    nếu plaintext quá dài (>72 byte bcrypt) thì fallback + log để server không crash.
    """
    raw = (plain_or_hash or "").strip()
    if not raw:
        return get_password_hash("admin123")
    if is_bcrypt_hash(raw):
        return raw
    try:
        return get_password_hash(raw)
    except ValueError:
        logger.warning(
            "SEED_ADMIN_PASSWORD vượt quá 72 byte (bcrypt). "
            "Dùng mật khẩu mặc định 'admin123' cho user seed. "
            "Hãy rút ngắn SEED_ADMIN_PASSWORD trong .env."
        )
        return get_password_hash("admin123")


def seed_database() -> None:
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        users = UserRepository(db)
        if users.get_by_email(settings.seed_admin_email) is None:
            users.create(
                email=settings.seed_admin_email,
                hashed_password=_hash_seed_admin_password(
                    settings.seed_admin_password
                ),
                role="admin",
                full_name=settings.seed_admin_full_name,
            )
            db.commit()

        products = ProductRepository(db)
        if products.count_all() == 0:
            samples = [
                {
                    "name": "Áo thun Shopee Basic",
                    "description": "Cotton 100%, nhiều màu",
                    "price": 99000,
                    "stock": 120,
                    "image_url": "https://picsum.photos/seed/shopee1/400/400",
                    "category": "Quần áo",
                },
                {
                    "name": "Tai nghe không dây",
                    "description": "Bluetooth 5.3, chống ồn",
                    "price": 450000,
                    "stock": 45,
                    "image_url": "https://picsum.photos/seed/shopee2/400/400",
                    "category": "Điện tử",
                },
                {
                    "name": "Bình giữ nhiệt 500ml",
                    "description": "Inox 304, giữ nóng 12h",
                    "price": 189000,
                    "stock": 80,
                    "image_url": "https://picsum.photos/seed/shopee3/400/400",
                    "category": "Nhà cửa",
                },
                {
                    "name": "Đèn bàn LED",
                    "description": "3 chế độ sáng, cổng USB",
                    "price": 259000,
                    "stock": 30,
                    "image_url": "https://picsum.photos/seed/shopee4/400/400",
                    "category": "Nhà cửa",
                },
                {
                    "name": "Điện thoại thông minh 128GB",
                    "description": "Màn hình 6.5 inch, pin trâu",
                    "price": 4290000,
                    "stock": 25,
                    "image_url": "https://picsum.photos/seed/shopee5/400/400",
                    "category": "Điện thoại",
                },
                {
                    "name": "Đồng hồ thể thao chống nước",
                    "description": "Đo nhịp tim, GPS",
                    "price": 890000,
                    "stock": 40,
                    "image_url": "https://picsum.photos/seed/shopee6/400/400",
                    "category": "Đồng hồ",
                },
            ]
            for row in samples:
                products.create(
                    name=row["name"],
                    description=row["description"],
                    price=row["price"],
                    stock=row["stock"],
                    image_url=row["image_url"],
                    category=row.get("category"),
                )
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_products_category_column()
    seed_database()
    yield


app = FastAPI(
    title="Shopee Clone API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routers(app)


@app.get("/health")
def health():
    return {"status": "ok"}

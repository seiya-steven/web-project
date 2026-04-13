"""
Kết nối PostgreSQL (Docker) qua SQLAlchemy 2.x.
Đặt DATABASE_URL trong .env hoặc dùng giá trị mặc định khớp docker-compose.yml.
"""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://shopee_user:shopee_pass@localhost:5432/shopee_db",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=os.getenv("SQLALCHEMY_ECHO", "").lower() in ("1", "true", "yes"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency FastAPI: mỗi request một session, luôn đóng sau khi xong."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

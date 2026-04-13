import re
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings

_BCRYPT_MODULAR_CRYPT = re.compile(r"^\$2[aby]\$\d{2}\$.{53}$")


def is_bcrypt_hash(value: str) -> bool:
    """
    Chuỗi hash bcrypt (modular crypt) — không được băm lần 2.
    """
    if not value or len(value) < 59:
        return False
    return bool(_BCRYPT_MODULAR_CRYPT.match(value))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    """
    Băm mật khẩu bằng bcrypt (thư viện `bcrypt` trực tiếp, tương thích bcrypt 4.x).
    Giới hạn 72 byte đầu vào. Nếu đã là chuỗi hash bcrypt thì trả về nguyên.
    """
    if is_bcrypt_hash(password):
        return password
    raw = password.encode("utf-8")
    if len(raw) > 72:
        raise ValueError(
            "Mật khẩu vượt quá 72 byte (giới hạn bcrypt). Hãy rút ngắn hoặc chỉ dùng UTF-8 ngắn hơn."
        )
    return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")


def create_access_token(subject: str, extra_claims: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode: dict = {"sub": subject, "exp": expire}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

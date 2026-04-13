from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _password_max_72_bytes(v: str) -> str:
    if len(v.encode("utf-8")) > 72:
        raise ValueError(
            "Mật khẩu không được vượt quá 72 byte (giới hạn bcrypt)."
        )
    return v


class UserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def password_bcrypt_limit(cls, v: str) -> str:
        return _password_max_72_bytes(v)


class UserLogin(BaseModel):
    """Body JSON gồm email và password (không dùng OAuth2PasswordRequestForm)."""

    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(gt=0)
    stock: int = Field(ge=0)
    image_url: str | None = None
    category: str | None = Field(default=None, max_length=128)

    @field_validator("category", mode="before")
    @classmethod
    def category_empty_as_none(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return v


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image_url: str | None = None
    category: str | None = Field(default=None, max_length=128)

    @field_validator("category", mode="before")
    @classmethod
    def category_empty_as_none(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return v


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: Decimal
    stock: int
    image_url: str | None
    category: str | None


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=9999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0, le=9999)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    quantity: int
    product: ProductResponse


class StatsResponse(BaseModel):
    total_users: int
    total_products: int

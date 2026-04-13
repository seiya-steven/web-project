from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_admin_user, get_current_user
from app.models import User
from app.schemas import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    StatsResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.admin_service import AdminService
from app.services.auth_service import AuthService
from app.services.cart_service import CartService
from app.services.product_service import ProductService

auth_router = APIRouter(prefix="/auth", tags=["auth"])

products_router = APIRouter(tags=["products"])

cart_router = APIRouter(prefix="/cart", tags=["cart"])

admin_router = APIRouter(prefix="/admin", tags=["admin"])


@auth_router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(data)


@auth_router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Nhận JSON gồm email và password; không dùng OAuth2PasswordRequestForm."""
    return AuthService(db).login(data)


@auth_router.get("/me", response_model=UserResponse)
def me(current: User = Depends(get_current_user)):
    return UserResponse.model_validate(current)


@products_router.get("/products", response_model=list[ProductResponse])
def list_products(
    category: str | None = Query(
        default=None,
        description="Lọc theo danh mục (khớp chính xác chuỗi category)",
    ),
    db: Session = Depends(get_db),
):
    return ProductService(db).list_products(category=category)


@cart_router.get("/items", response_model=list[CartItemResponse])
def cart_list(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).list_items(current.id)


@cart_router.post(
    "/items",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def cart_add(
    data: CartItemCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).add_item(current.id, data)


@cart_router.patch("/items/{item_id}", response_model=CartItemResponse)
def cart_update(
    item_id: int,
    data: CartItemUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).update_item(current.id, item_id, data)


@cart_router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def cart_delete(
    item_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    CartService(db).remove_item(current.id, item_id)
    return None


@admin_router.get("/stats", response_model=StatsResponse)
def admin_stats(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return AdminService(db).stats()


@admin_router.get("/users", response_model=list[UserResponse])
def admin_users(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return AdminService(db).list_users()


@admin_router.get("/products", response_model=list[ProductResponse])
def admin_products(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return AdminService(db).list_products()


@admin_router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_product_create(
    data: ProductCreate,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return ProductService(db).create_product(data)


@admin_router.patch("/products/{product_id}", response_model=ProductResponse)
def admin_product_update(
    product_id: int,
    data: ProductUpdate,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return ProductService(db).update_product(product_id, data)


@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_product_delete(
    product_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    ProductService(db).delete_product(product_id)
    return None


def register_routers(app):
    app.include_router(auth_router)
    app.include_router(products_router)
    app.include_router(cart_router)
    app.include_router(admin_router)

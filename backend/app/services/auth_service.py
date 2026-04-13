from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.security import create_access_token, get_password_hash, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def register(self, data: UserCreate) -> TokenResponse:
        if self.users.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được sử dụng",
            )
        user = self.users.create(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            role="customer",
            full_name=data.full_name,
        )
        self.db.commit()
        self.db.refresh(user)
        token = create_access_token(
            str(user.id), extra_claims={"role": user.role, "email": user.email}
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    def login(self, data: UserLogin) -> TokenResponse:
        user = self.users.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không đúng",
            )
        token = create_access_token(
            str(user.id), extra_claims={"role": user.role, "email": user.email}
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    def get_user(self, user_id: int) -> UserResponse:
        user = self.users.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng",
            )
        return UserResponse.model_validate(user)

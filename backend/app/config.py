from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    # Không dùng .local — EmailStr/email-validator từ chối TLD đặc biệt RFC 6761
    seed_admin_email: str = "admin@shopeeclone.dev"
    seed_admin_password: str = "admin123"
    seed_admin_full_name: str = "Administrator"


settings = Settings()

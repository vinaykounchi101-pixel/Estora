from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Estora"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev_secret_key_change_me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "estora"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ML_ARTIFACTS_DIR: str = "../../ml/artifacts"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

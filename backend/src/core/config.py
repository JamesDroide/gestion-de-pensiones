"""
Configuración central de la aplicación usando pydantic-settings.
"""
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_SECRET_KEY = "change-this-in-production"
_INSECURE_ORIGINS = {"*", ""}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de datos
    DATABASE_URL: str = "postgresql://postgres:jamesdroide@localhost:5432/pension_db"

    # JWT
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # App
    APP_NAME: str = "Sistema de Gestión de Pensionistas"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS — lista separada por comas
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    def _validate_production_security(self) -> None:
        """
        Verifica configuraciones críticas de seguridad al iniciar en producción.
        Aborta el proceso si se detectan valores inseguros por defecto.
        """
        if self.ENVIRONMENT != "production":
            return

        errors: list[str] = []

        if self.SECRET_KEY == _DEFAULT_SECRET_KEY:
            errors.append(
                "SECRET_KEY tiene el valor por defecto inseguro. "
                "Define SECRET_KEY en las variables de entorno."
            )

        insecure_origins = [o for o in self.ALLOWED_ORIGINS if o in _INSECURE_ORIGINS]
        if insecure_origins:
            errors.append(
                "ALLOWED_ORIGINS contiene valores inseguros ('*' o vacío) en producción. "
                "Define orígenes explícitos."
            )

        if errors:
            print("[ERROR DE SEGURIDAD] La aplicación no puede iniciarse en producción:")
            for err in errors:
                print(f"  - {err}")
            sys.exit(1)


settings = Settings()
settings._validate_production_security()

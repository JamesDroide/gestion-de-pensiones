"""Generación y validación de tokens JWT."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from src.core.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Genera un token JWT firmado con los datos del usuario.
    Por defecto expira según ACCESS_TOKEN_EXPIRE_MINUTES en la configuración.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decodifica y valida un token JWT.
    Lanza JWTError si el token es inválido o expiró.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

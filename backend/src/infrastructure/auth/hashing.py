"""Utilidades para hashear y verificar contraseñas usando bcrypt directamente."""
import bcrypt


def hash_password(plain: str) -> str:
    """Genera el hash bcrypt de una contraseña en texto plano."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica que una contraseña en texto plano coincida con su hash almacenado."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

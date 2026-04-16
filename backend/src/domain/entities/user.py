"""
Entidad de dominio: Usuario del sistema.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """Rol del usuario en el sistema."""
    ADMINISTRATOR = "administrator"
    CASHIER = "cashier"


@dataclass
class User:
    """
    Usuario del sistema con rol definido.
    Administrador tiene acceso total; cajero solo registro y consulta.
    """
    id: int
    name: str
    email: str
    password_hash: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)

"""
Entidad de dominio: Pensionista policía.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Police:
    """
    Representa a un pensionista policía del restaurante.
    Paga principalmente con tickets físicos.
    El tipo no puede cambiar una vez creado.
    """
    id: int
    full_name: str
    badge_code: str       # Número de placa o código — único en el sistema
    rank: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

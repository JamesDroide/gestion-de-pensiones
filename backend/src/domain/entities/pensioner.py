"""
Entidad de dominio: Pensionista civil.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class PaymentMode(str, Enum):
    """Modalidad de cobro acordada con el pensionista."""
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


@dataclass
class Pensioner:
    """
    Representa a un pensionista del restaurante.
    El tipo no puede cambiar una vez creado.
    """
    id: int
    full_name: str
    id_code: str          # DNI o código interno — único en el sistema
    payment_mode: PaymentMode
    no_pension_rules: bool = False  # Si True, usa precio del menú base en vez de reglas de pensión
    phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

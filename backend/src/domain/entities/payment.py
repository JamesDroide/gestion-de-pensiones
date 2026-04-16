"""
Entidad de dominio: Pago recibido.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional


class PaymentType(str, Enum):
    """Tipo de pago recibido."""
    CASH = "cash"
    TICKETS = "tickets"
    YAPE = "yape"


@dataclass
class Payment:
    """
    Registro de un pago recibido de un pensionista.
    Puede ser de un pensionista o de un policía, nunca ambos.
    """
    id: int
    amount: Decimal
    payment_type: PaymentType
    pensioner_id: Optional[int] = None
    police_id: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    discount_type: Optional[str] = None          # 'percent' | 'fixed'
    discount_value: Optional[Decimal] = None     # valor ingresado (10 para 10% o 5.00 para S/5)
    discount_amount: Decimal = field(default_factory=lambda: Decimal("0.00"))  # monto calculado

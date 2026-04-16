"""
Entidad de dominio: Extra (plato a la carta) consumido.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class ExtraConsumption:
    """
    Plato a la carta consumido por un pensionista.
    El precio siempre se guarda como snapshot — nunca se descuenta por pensión.
    Puede pertenecer a un consumo de pensionista O a un consumo policía, nunca ambos.
    """
    id: int
    dish_name: str
    unit_price_snapshot: Decimal     # precio al momento del consumo
    quantity: int
    subtotal: Decimal
    pensioner_consumption_id: Optional[int] = None
    police_consumption_id: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

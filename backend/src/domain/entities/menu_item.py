"""
Entidad de dominio: Ítem del menú o carta.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum


class MenuItemType(str, Enum):
    """Tipo de ítem del menú."""
    DAILY_MENU = "daily_menu"    # Plato del menú del día
    EXTRA = "extra"              # Plato a la carta (precio siempre normal)


@dataclass
class MenuItem:
    """
    Representa un plato del menú o de la carta de extras.
    Los extras se cobran siempre al precio normal, sin descuento de pensión.
    """
    id: int
    name: str
    price: Decimal
    item_type: MenuItemType
    is_price_editable: bool = False   # Si el admin puede editar el precio al momento
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)

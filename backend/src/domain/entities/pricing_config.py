"""
Entidad de dominio: Configuración de precios del sistema.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class PricingConfig:
    """
    Configuración central de precios.
    Los cambios aquí NO afectan registros históricos ya cerrados.
    Los consumos guardan snapshots al momento del registro.
    """
    id: int
    # Precio base del menú (para pensionistas sin reglas de pensión)
    menu_price: Decimal = Decimal("12.00")
    # Precios escalonados para civiles
    menu_price_normal: Decimal = Decimal("10.00")     # 1 comida
    menu_price_2_meals: Decimal = Decimal("9.00")     # 2 comidas
    menu_price_3_meals: Decimal = Decimal("8.00")     # 3 comidas
    # Valores de tickets para policías
    breakfast_ticket_value: Decimal = Decimal("4.00")
    lunch_ticket_value: Decimal = Decimal("8.00")
    dinner_price: Decimal = Decimal("6.00")
    # Equivalencia para cena (número de tickets desayuno = 1 cena)
    dinner_ticket_equivalence: int = 2
    updated_at: datetime = field(default_factory=datetime.utcnow)
    updated_by: Optional[int] = None   # id del usuario que actualizó

"""
Entidades de dominio: Consumo diario (pensionistas y policías por separado).
"""
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


@dataclass
class ExtraItem:
    """Ítem de consumo extra (plato/producto adicional)."""
    dish_name: str
    unit_price_snapshot: Decimal
    quantity: int
    subtotal: Decimal


@dataclass
class PensionerConsumption:
    """
    Registro de consumo diario de un pensionista.
    Cada comida almacena un conteo (0 = no consumió, ≥1 = cantidad de porciones).
    Solo pensionistas con no_pension_rules=True o policías pueden tener count > 1.
    """
    id: int
    pensioner_id: int
    date: date
    breakfast_count: int = 0
    lunch_count: int = 0
    dinner_count: int = 0
    extras_total: Decimal = Decimal("0.00")
    extras: list = field(default_factory=list)  # list[ExtraItem]
    # Snapshots guardados al cerrar el día — NUNCA referenciar config
    unit_price_snapshot: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    is_closed: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def has_breakfast(self) -> bool:
        return self.breakfast_count > 0

    @property
    def has_lunch(self) -> bool:
        return self.lunch_count > 0

    @property
    def has_dinner(self) -> bool:
        return self.dinner_count > 0

    @property
    def meal_count(self) -> int:
        """Número total de porciones consumidas (suma de los tres conteos)."""
        return self.breakfast_count + self.lunch_count + self.dinner_count

    @property
    def unique_meal_count(self) -> int:
        """Número de tipos de comida distintos (máx 3). Usado para tiers de precio."""
        return sum([self.has_breakfast, self.has_lunch, self.has_dinner])


@dataclass
class PoliceConsumption:
    """
    Registro de consumo diario de un pensionista policía.
    Cada comida almacena un conteo — los policías pueden registrar >1 porción.
    """
    id: int
    police_id: int
    date: date
    breakfast_count: int = 0
    lunch_count: int = 0
    dinner_count: int = 0
    # Snapshots de precios al momento del registro
    breakfast_ticket_value_snapshot: Decimal = Decimal("0.00")
    lunch_ticket_value_snapshot: Decimal = Decimal("0.00")
    dinner_price_snapshot: Decimal = Decimal("0.00")
    # Totales
    extras_total: Decimal = Decimal("0.00")
    extras: list = field(default_factory=list)  # list[ExtraItem]
    total: Decimal = Decimal("0.00")
    created_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def has_breakfast(self) -> bool:
        return self.breakfast_count > 0

    @property
    def has_lunch(self) -> bool:
        return self.lunch_count > 0

    @property
    def has_dinner(self) -> bool:
        return self.dinner_count > 0

    @property
    def meal_count(self) -> int:
        """Número total de porciones consumidas."""
        return self.breakfast_count + self.lunch_count + self.dinner_count

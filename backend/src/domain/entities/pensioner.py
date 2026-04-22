"""
Entidad de dominio: Pensionista civil.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional


class PaymentMode(str, Enum):
    """Modalidad de cobro acordada con el pensionista."""
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class NoPensionPriceMode(str, Enum):
    MENU_PRICE = "menu_price"
    CUSTOM_TIERED = "custom_tiered"
    CUSTOM_BY_TYPE = "custom_by_type"


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
    no_pension_price_mode: NoPensionPriceMode = NoPensionPriceMode.MENU_PRICE
    phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    custom_price_1_meal: Optional[Decimal] = None
    custom_price_2_meals: Optional[Decimal] = None
    custom_price_3_meals: Optional[Decimal] = None
    custom_breakfast_price: Optional[Decimal] = None
    custom_lunch_price: Optional[Decimal] = None
    custom_dinner_price: Optional[Decimal] = None

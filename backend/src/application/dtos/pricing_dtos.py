"""DTOs para configuración de precios del sistema."""
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class PricingConfigResponseDTO(BaseModel):
    id: int
    menu_price: Decimal
    menu_price_normal: Decimal
    menu_price_2_meals: Decimal
    menu_price_3_meals: Decimal
    breakfast_ticket_value: Decimal
    lunch_ticket_value: Decimal
    dinner_price: Decimal
    dinner_ticket_equivalence: int

    model_config = {"from_attributes": True}


class PricingConfigUpdateDTO(BaseModel):
    menu_price: Optional[Decimal] = None
    menu_price_normal: Optional[Decimal] = None
    menu_price_2_meals: Optional[Decimal] = None
    menu_price_3_meals: Optional[Decimal] = None
    breakfast_ticket_value: Optional[Decimal] = None
    lunch_ticket_value: Optional[Decimal] = None
    dinner_price: Optional[Decimal] = None
    dinner_ticket_equivalence: Optional[int] = None

"""DTOs para registro de consumo diario (pensionistas y policías)."""
from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class AddExtraDTO(BaseModel):
    dish_name: str
    unit_price: Decimal
    quantity: int = 1


class RegisterPensionerConsumptionDTO(BaseModel):
    pensioner_id: int
    date: date
    breakfast_count: int = 0
    lunch_count: int = 0
    dinner_count: int = 0
    extras: list[AddExtraDTO] = []
    extras_total: Decimal = Decimal("0.00")


class RegisterPoliceConsumptionDTO(BaseModel):
    police_id: int
    date: date
    breakfast_count: int = 0
    lunch_count: int = 0
    dinner_count: int = 0
    extras: list[AddExtraDTO] = []


class ExtraItemDTO(BaseModel):
    dish_name: str
    unit_price_snapshot: Decimal
    quantity: int
    subtotal: Decimal

    model_config = {"from_attributes": True}


class PensionerConsumptionResponseDTO(BaseModel):
    id: int
    pensioner_id: int
    date: date
    breakfast_count: int
    lunch_count: int
    dinner_count: int
    has_breakfast: bool
    has_lunch: bool
    has_dinner: bool
    meal_count: int
    extras_total: Decimal
    extras: list[ExtraItemDTO] = []
    unit_price_snapshot: Optional[Decimal]
    total_price: Optional[Decimal]
    is_closed: bool

    model_config = {"from_attributes": True}


class PoliceConsumptionResponseDTO(BaseModel):
    id: int
    police_id: int
    date: date
    breakfast_count: int
    lunch_count: int
    dinner_count: int
    has_breakfast: bool
    has_lunch: bool
    has_dinner: bool
    breakfast_ticket_value_snapshot: Decimal
    lunch_ticket_value_snapshot: Decimal
    dinner_price_snapshot: Decimal
    extras_total: Decimal
    extras: list[ExtraItemDTO] = []
    total: Decimal

    model_config = {"from_attributes": True}

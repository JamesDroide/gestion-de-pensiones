"""DTOs para operaciones de pensionistas."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, field_validator
from src.domain.entities.pensioner import PaymentMode, NoPensionPriceMode


class PensionerCreateDTO(BaseModel):
    full_name: str
    id_code: str
    payment_mode: PaymentMode
    no_pension_rules: bool = False
    no_pension_price_mode: NoPensionPriceMode = NoPensionPriceMode.MENU_PRICE
    phone: Optional[str] = None
    notes: Optional[str] = None
    custom_price_1_meal: Optional[Decimal] = None
    custom_price_2_meals: Optional[Decimal] = None
    custom_price_3_meals: Optional[Decimal] = None
    custom_breakfast_price: Optional[Decimal] = None
    custom_lunch_price: Optional[Decimal] = None
    custom_dinner_price: Optional[Decimal] = None

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        """Valida que el nombre no sea solo espacios en blanco."""
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()

    @field_validator("id_code")
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        """Valida y normaliza el código DNI a mayúsculas."""
        if not v.strip():
            raise ValueError("El DNI o código no puede estar vacío")
        return v.strip().upper()


class PensionerUpdateDTO(BaseModel):
    full_name: Optional[str] = None
    payment_mode: Optional[PaymentMode] = None
    no_pension_rules: Optional[bool] = None
    no_pension_price_mode: Optional[NoPensionPriceMode] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    custom_price_1_meal: Optional[Decimal] = None
    custom_price_2_meals: Optional[Decimal] = None
    custom_price_3_meals: Optional[Decimal] = None
    custom_breakfast_price: Optional[Decimal] = None
    custom_lunch_price: Optional[Decimal] = None
    custom_dinner_price: Optional[Decimal] = None


class PensionerResponseDTO(BaseModel):
    id: int
    full_name: str
    id_code: str
    payment_mode: PaymentMode
    no_pension_rules: bool
    no_pension_price_mode: NoPensionPriceMode
    phone: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    custom_price_1_meal: Optional[Decimal]
    custom_price_2_meals: Optional[Decimal]
    custom_price_3_meals: Optional[Decimal]
    custom_breakfast_price: Optional[Decimal]
    custom_lunch_price: Optional[Decimal]
    custom_dinner_price: Optional[Decimal]

    model_config = {"from_attributes": True}

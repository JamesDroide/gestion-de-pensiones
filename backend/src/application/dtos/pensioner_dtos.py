"""DTOs para operaciones de pensionistas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from src.domain.entities.pensioner import PaymentMode


class PensionerCreateDTO(BaseModel):
    full_name: str
    id_code: str
    payment_mode: PaymentMode
    no_pension_rules: bool = False
    phone: Optional[str] = None
    notes: Optional[str] = None

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
    phone: Optional[str] = None
    notes: Optional[str] = None


class PensionerResponseDTO(BaseModel):
    id: int
    full_name: str
    id_code: str
    payment_mode: PaymentMode
    no_pension_rules: bool
    phone: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

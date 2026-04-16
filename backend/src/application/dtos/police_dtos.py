"""DTOs para operaciones de pensionistas policías."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class PoliceCreateDTO(BaseModel):
    full_name: str
    badge_code: str
    rank: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        """Valida que el nombre no sea solo espacios en blanco."""
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()

    @field_validator("badge_code")
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        """Valida y normaliza la placa o código a mayúsculas."""
        if not v.strip():
            raise ValueError("El código o placa no puede estar vacío")
        return v.strip().upper()


class PoliceUpdateDTO(BaseModel):
    full_name: Optional[str] = None
    rank: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class PoliceResponseDTO(BaseModel):
    id: int
    full_name: str
    badge_code: str
    rank: Optional[str]
    phone: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

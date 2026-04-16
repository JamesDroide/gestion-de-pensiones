"""
Tests unitarios para la entidad Civilian.
"""
import pytest
from src.domain.entities.civilian import Civilian, PaymentMode


def test_civilian_creation():
    """Verifica que un civil se crea con los campos correctos."""
    civilian = Civilian(id=1, full_name="Juan Pérez", id_code="12345678", payment_mode=PaymentMode.MONTHLY)
    assert civilian.full_name == "Juan Pérez"
    assert civilian.is_active is True
    assert civilian.payment_mode == PaymentMode.MONTHLY


def test_civilian_optional_fields_default_none():
    """Los campos opcionales deben ser None por defecto."""
    civilian = Civilian(id=1, full_name="Ana García", id_code="87654321", payment_mode=PaymentMode.WEEKLY)
    assert civilian.phone is None
    assert civilian.notes is None

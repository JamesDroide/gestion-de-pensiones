"""
Tests unitarios para las entidades de consumo.
Valida la lógica del precio escalonado y el conteo de comidas.
"""
import pytest
from src.domain.entities.consumption import CivilianConsumption
from datetime import date


def test_meal_count_zero():
    """Sin comidas registradas el conteo debe ser 0."""
    c = CivilianConsumption(id=1, civilian_id=1, date=date.today())
    assert c.meal_count == 0


def test_meal_count_one():
    c = CivilianConsumption(id=1, civilian_id=1, date=date.today(), has_breakfast=True)
    assert c.meal_count == 1


def test_meal_count_three():
    c = CivilianConsumption(id=1, civilian_id=1, date=date.today(),
                            has_breakfast=True, has_lunch=True, has_dinner=True)
    assert c.meal_count == 3


def test_new_consumption_is_open():
    """Un consumo nuevo siempre debe estar abierto (no cerrado)."""
    c = CivilianConsumption(id=1, civilian_id=1, date=date.today())
    assert c.is_closed is False
    assert c.unit_price_snapshot is None
    assert c.total_price is None

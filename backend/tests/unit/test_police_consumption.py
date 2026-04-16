"""
Tests para el caso de uso de registro de consumo de policías.
Valida la lógica de tickets y cálculo de diferencial.
"""
import pytest
from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock
from src.domain.entities.consumption import PoliceConsumption
from src.domain.entities.pricing_config import PricingConfig
from src.application.dtos.consumption_dtos import RegisterPoliceConsumptionDTO
from src.application.use_cases.consumption.register_police_consumption import RegisterPoliceConsumptionUseCase
from src.domain.entities.police import Police


def make_config() -> PricingConfig:
    """Crea una configuración de precios de prueba."""
    return PricingConfig(
        id=1,
        breakfast_ticket_value=Decimal("4.00"),
        lunch_ticket_value=Decimal("8.00"),
    )


def make_police() -> Police:
    """Crea un policía de prueba."""
    return Police(id=1, full_name="Carlos Mendoza", badge_code="PNP-001")


def make_use_case(police, config, existing=None):
    """Construye el caso de uso con mocks de repositorios."""
    police_repo = AsyncMock()
    police_repo.get_by_id.return_value = police

    consumption_repo = AsyncMock()
    consumption_repo.get_by_police_and_date.return_value = existing
    consumption_repo.create = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    return RegisterPoliceConsumptionUseCase(
        consumption_repo=consumption_repo,
        police_repo=police_repo,
        pricing_repo=pricing_repo,
    )


@pytest.mark.asyncio
async def test_police_consumption_100_percent_tickets():
    """
    Consumo cubierto 100% con tickets.
    Si se presentan 1 ticket de desayuno (4.00) y 1 de almuerzo (8.00),
    el total_ticket_value debe ser 12.00 y el cash_paid 0.
    """
    config = make_config()
    police = make_police()
    use_case = make_use_case(police, config)

    dto = RegisterPoliceConsumptionDTO(
        police_id=1,
        date=date(2026, 4, 11),
        has_breakfast=True,
        has_lunch=True,
        has_dinner=False,
        breakfast_tickets_used=1,
        lunch_tickets_used=1,
        cash_paid=Decimal("0.00"),
    )

    result = await use_case.execute(dto)

    assert result.total_ticket_value == Decimal("12.00")
    assert result.cash_paid == Decimal("0.00")
    assert result.total == Decimal("12.00")
    assert result.breakfast_ticket_value_snapshot == Decimal("4.00")
    assert result.lunch_ticket_value_snapshot == Decimal("8.00")


@pytest.mark.asyncio
async def test_police_consumption_mixed_tickets_and_cash():
    """
    Consumo mixto: tickets + efectivo.
    1 ticket desayuno (4.00) + efectivo adicional (6.00) = total 10.00.
    """
    config = make_config()
    police = make_police()
    use_case = make_use_case(police, config)

    dto = RegisterPoliceConsumptionDTO(
        police_id=1,
        date=date(2026, 4, 11),
        has_breakfast=True,
        has_lunch=True,
        has_dinner=False,
        breakfast_tickets_used=1,
        lunch_tickets_used=0,
        cash_paid=Decimal("6.00"),
    )

    result = await use_case.execute(dto)

    assert result.total_ticket_value == Decimal("4.00")
    assert result.cash_paid == Decimal("6.00")
    assert result.total == Decimal("10.00")


@pytest.mark.asyncio
async def test_police_consumption_100_percent_cash():
    """
    Consumo 100% en efectivo (sin tickets).
    No debe lanzar error — el policía puede pagar sin presentar tickets.
    """
    config = make_config()
    police = make_police()
    use_case = make_use_case(police, config)

    dto = RegisterPoliceConsumptionDTO(
        police_id=1,
        date=date(2026, 4, 11),
        has_breakfast=True,
        has_lunch=True,
        has_dinner=True,
        breakfast_tickets_used=0,
        lunch_tickets_used=0,
        cash_paid=Decimal("24.00"),
    )

    result = await use_case.execute(dto)

    assert result.total_ticket_value == Decimal("0.00")
    assert result.cash_paid == Decimal("24.00")
    assert result.total == Decimal("24.00")


@pytest.mark.asyncio
async def test_police_consumption_snapshot_saved_at_registration():
    """
    Los precios de tickets se guardan como snapshot en el momento del registro,
    no como referencia a la configuración actual.
    Se verifican los campos snapshot en la entidad creada.
    """
    config = make_config()
    police = make_police()
    use_case = make_use_case(police, config)

    dto = RegisterPoliceConsumptionDTO(
        police_id=1,
        date=date(2026, 4, 11),
        has_breakfast=True,
        has_lunch=True,
        has_dinner=False,
        breakfast_tickets_used=2,
        lunch_tickets_used=1,
        cash_paid=Decimal("0.00"),
    )

    result = await use_case.execute(dto)

    # Verificar que los snapshots reflejan los precios en el momento del registro
    assert result.breakfast_ticket_value_snapshot == Decimal("4.00")
    assert result.lunch_ticket_value_snapshot == Decimal("8.00")
    # 2 tickets desayuno (4.00 c/u) + 1 ticket almuerzo (8.00) = 16.00
    assert result.total_ticket_value == Decimal("16.00")

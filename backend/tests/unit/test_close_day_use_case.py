"""
Tests unitarios para el caso de uso CloseDayUseCase.
Valida la lógica de precio escalonado para civiles al cerrar el día.
No requiere base de datos real — usa mocks de los repositorios.
"""
import pytest
from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
from src.domain.entities.consumption import CivilianConsumption
from src.domain.entities.pricing_config import PricingConfig
from src.application.use_cases.consumption.close_day import CloseDayUseCase


def make_config() -> PricingConfig:
    """Crea una configuración de precios de prueba."""
    return PricingConfig(
        id=1,
        menu_price_normal=Decimal("10.00"),
        menu_price_2_meals=Decimal("9.00"),
        menu_price_3_meals=Decimal("8.00"),
        breakfast_ticket_value=Decimal("4.00"),
        lunch_ticket_value=Decimal("8.00"),
        dinner_ticket_equivalence=2,
    )


def make_consumption(civilian_id: int, breakfast: bool, lunch: bool, dinner: bool) -> CivilianConsumption:
    """Crea un consumo civil de prueba con las comidas indicadas."""
    return CivilianConsumption(
        id=civilian_id,
        civilian_id=civilian_id,
        date=date(2026, 4, 11),
        has_breakfast=breakfast,
        has_lunch=lunch,
        has_dinner=dinner,
        extras_total=Decimal("0.00"),
        is_closed=False,
    )


@pytest.mark.asyncio
async def test_close_day_1_meal_uses_normal_price():
    """Cierre con 1 comida debe aplicar el precio normal (10.00 × 1 = 10.00)."""
    consumption = make_consumption(1, breakfast=True, lunch=False, dinner=False)
    config = make_config()

    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = [consumption]
    consumption_repo.update = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 1
    assert consumption.unit_price_snapshot == Decimal("10.00")
    assert consumption.total_price == Decimal("10.00")
    assert consumption.is_closed is True


@pytest.mark.asyncio
async def test_close_day_2_meals_uses_discounted_price():
    """Cierre con 2 comidas debe aplicar precio por 2 comidas (9.00 × 2 = 18.00)."""
    consumption = make_consumption(2, breakfast=True, lunch=True, dinner=False)
    config = make_config()

    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = [consumption]
    consumption_repo.update = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 1
    assert consumption.unit_price_snapshot == Decimal("9.00")
    assert consumption.total_price == Decimal("18.00")
    assert consumption.is_closed is True


@pytest.mark.asyncio
async def test_close_day_3_meals_uses_full_pension_price():
    """Cierre con 3 comidas debe aplicar precio de pensión completa (8.00 × 3 = 24.00)."""
    consumption = make_consumption(3, breakfast=True, lunch=True, dinner=True)
    config = make_config()

    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = [consumption]
    consumption_repo.update = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 1
    assert consumption.unit_price_snapshot == Decimal("8.00")
    assert consumption.total_price == Decimal("24.00")
    assert consumption.is_closed is True


@pytest.mark.asyncio
async def test_close_day_0_meals_zero_price():
    """Cierre sin comidas del menú (solo extras) debe asignar precio unitario 0.00."""
    consumption = make_consumption(4, breakfast=False, lunch=False, dinner=False)
    consumption.extras_total = Decimal("5.00")
    config = make_config()

    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = [consumption]
    consumption_repo.update = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 1
    assert consumption.unit_price_snapshot == Decimal("0.00")
    # Total = 0 (precio unitario × 0 comidas) + 5.00 (extras)
    assert consumption.total_price == Decimal("5.00")
    assert consumption.is_closed is True


@pytest.mark.asyncio
async def test_close_day_no_open_consumptions():
    """Si no hay consumos abiertos debe retornar 0 cerrados y el mensaje correcto."""
    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = []

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = make_config()

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 0
    assert "No hay consumos abiertos" in result["message"]


@pytest.mark.asyncio
async def test_close_day_multiple_consumptions():
    """Cierre con múltiples civiles debe cerrar todos correctamente."""
    consumptions = [
        make_consumption(1, breakfast=True, lunch=False, dinner=False),   # 1 comida
        make_consumption(2, breakfast=True, lunch=True, dinner=False),    # 2 comidas
        make_consumption(3, breakfast=True, lunch=True, dinner=True),     # 3 comidas
    ]
    config = make_config()

    consumption_repo = AsyncMock()
    consumption_repo.get_open_by_date.return_value = consumptions
    consumption_repo.update = AsyncMock(side_effect=lambda c: c)

    pricing_repo = AsyncMock()
    pricing_repo.get_current.return_value = config

    use_case = CloseDayUseCase(consumption_repo, pricing_repo)
    result = await use_case.execute(date(2026, 4, 11))

    assert result["closed"] == 3
    assert consumptions[0].unit_price_snapshot == Decimal("10.00")
    assert consumptions[1].unit_price_snapshot == Decimal("9.00")
    assert consumptions[2].unit_price_snapshot == Decimal("8.00")
    assert all(c.is_closed for c in consumptions)

"""
Tests unitarios para los casos de uso de pensionistas civiles.
No requiere base de datos real — usa mocks de repositorios.
"""
import pytest
from datetime import datetime
from unittest.mock import AsyncMock
from fastapi import HTTPException
from src.domain.entities.civilian import Civilian, PaymentMode
from src.application.dtos.civilian_dtos import CivilianCreateDTO, CivilianUpdateDTO
from src.application.use_cases.civilians.create_civilian import CreateCivilianUseCase
from src.application.use_cases.civilians.get_civilian import GetCivilianUseCase
from src.application.use_cases.civilians.update_civilian import UpdateCivilianUseCase


def make_civilian(id: int = 1, id_code: str = "12345678") -> Civilian:
    """Crea una entidad Civilian de prueba."""
    return Civilian(
        id=id,
        full_name="Juan Pérez",
        id_code=id_code,
        payment_mode=PaymentMode.MONTHLY,
        phone="999000111",
        notes=None,
        is_active=True,
        created_at=datetime(2026, 4, 11),
        updated_at=datetime(2026, 4, 11),
    )


@pytest.mark.asyncio
async def test_create_civilian_duplicate_code_raises_409():
    """Crear un civil con código DNI ya registrado debe lanzar HTTPException 409."""
    repo = AsyncMock()
    repo.get_by_id_code.return_value = make_civilian()  # simula que ya existe

    dto = CivilianCreateDTO(
        full_name="Pedro Gómez",
        id_code="12345678",
        payment_mode=PaymentMode.WEEKLY,
    )

    use_case = CreateCivilianUseCase(repo)
    with pytest.raises(HTTPException) as exc_info:
        await use_case.execute(dto)

    assert exc_info.value.status_code == 409
    assert "12345678" in exc_info.value.detail


@pytest.mark.asyncio
async def test_create_civilian_unique_code_returns_entity():
    """Crear un civil con código único debe retornar la entidad correcta."""
    expected = make_civilian()
    repo = AsyncMock()
    repo.get_by_id_code.return_value = None  # no existe aún
    repo.create.return_value = expected

    dto = CivilianCreateDTO(
        full_name="Juan Pérez",
        id_code="12345678",
        payment_mode=PaymentMode.MONTHLY,
        phone="999000111",
    )

    use_case = CreateCivilianUseCase(repo)
    result = await use_case.execute(dto)

    assert result.full_name == "Juan Pérez"
    assert result.id_code == "12345678"
    assert result.payment_mode == PaymentMode.MONTHLY
    repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_get_civilian_not_found_raises_404():
    """Obtener un civil con ID inexistente debe lanzar HTTPException 404."""
    repo = AsyncMock()
    repo.get_by_id.return_value = None  # no existe

    use_case = GetCivilianUseCase(repo)
    with pytest.raises(HTTPException) as exc_info:
        await use_case.execute(civilian_id=999)

    assert exc_info.value.status_code == 404
    assert "no encontrado" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_update_civilian_modifies_only_sent_fields():
    """
    Actualizar un civil debe modificar solo los campos provistos.
    Los campos None en el DTO no deben sobreescribir los valores existentes.
    """
    original = make_civilian()
    original.phone = "999000111"
    original.payment_mode = PaymentMode.MONTHLY

    repo = AsyncMock()
    repo.get_by_id.return_value = original
    repo.update = AsyncMock(side_effect=lambda c: c)

    # Solo se cambia el nombre — phone y payment_mode deben conservarse
    dto = CivilianUpdateDTO(full_name="Juan Pérez Actualizado")

    use_case = UpdateCivilianUseCase(repo)
    result = await use_case.execute(civilian_id=1, dto=dto)

    assert result.full_name == "Juan Pérez Actualizado"
    assert result.phone == "999000111"           # no se modificó
    assert result.payment_mode == PaymentMode.MONTHLY  # no se modificó
    repo.update.assert_called_once()

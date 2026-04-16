"""
Router de la API para registro de consumo diario.
Civiles y policías tienen endpoints separados por sus modelos de pago distintos.
"""
from datetime import date
from typing import Optional, List
from calendar import monthrange
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.session import get_db
from src.infrastructure.repositories.pensioner_repository_impl import SQLAlchemyPensionerRepository
from src.infrastructure.repositories.police_repository_impl import SQLAlchemyPoliceRepository
from src.infrastructure.repositories.pensioner_consumption_repository_impl import SQLAlchemyPensionerConsumptionRepository
from src.infrastructure.repositories.police_consumption_repository_impl import SQLAlchemyPoliceConsumptionRepository
from src.infrastructure.repositories.pricing_config_repository_impl import SQLAlchemyPricingConfigRepository
from src.application.use_cases.consumption.register_pensioner_consumption import RegisterPensionerConsumptionUseCase
from src.application.use_cases.consumption.register_police_consumption import RegisterPoliceConsumptionUseCase
from src.application.dtos.consumption_dtos import (
    RegisterPensionerConsumptionDTO,
    RegisterPoliceConsumptionDTO,
    PensionerConsumptionResponseDTO,
    PoliceConsumptionResponseDTO,
)
from src.api.dependencies.auth import get_current_user
from src.infrastructure.database.models.user_model import UserModel

router = APIRouter(prefix="/consumption", tags=["Consumo"])


@router.post("/pensioner", response_model=PensionerConsumptionResponseDTO, status_code=201)
async def register_pensioner_consumption(
    dto: RegisterPensionerConsumptionDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Registra o actualiza el consumo diario de un pensionista.
    Si ya existe un registro para esa fecha, se actualiza (no duplica).
    No se puede modificar si el día ya fue cerrado.
    """
    use_case = RegisterPensionerConsumptionUseCase(
        consumption_repo=SQLAlchemyPensionerConsumptionRepository(db),
        pensioner_repo=SQLAlchemyPensionerRepository(db),
    )
    return await use_case.execute(dto)


@router.post("/police", response_model=PoliceConsumptionResponseDTO, status_code=201)
async def register_police_consumption(
    dto: RegisterPoliceConsumptionDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Registra el consumo diario de un pensionista policía con tickets y/o efectivo.
    No permite duplicados en la misma fecha.
    """
    use_case = RegisterPoliceConsumptionUseCase(
        consumption_repo=SQLAlchemyPoliceConsumptionRepository(db),
        police_repo=SQLAlchemyPoliceRepository(db),
        pricing_repo=SQLAlchemyPricingConfigRepository(db),
    )
    return await use_case.execute(dto)


@router.get("/pensioner/{pensioner_id}", response_model=List[PensionerConsumptionResponseDTO])
async def get_pensioner_history(
    pensioner_id: int,
    month: str = Query(..., description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Retorna el historial de consumo de un pensionista para un mes dado.
    Ejemplo: ?month=2025-04
    """
    repo = SQLAlchemyPensionerConsumptionRepository(db)
    year, m = map(int, month.split("-"))
    from_date = date(year, m, 1)
    to_date = date(year, m, monthrange(year, m)[1])
    return await repo.get_history(pensioner_id, from_date, to_date)


@router.get("/pensioner/{pensioner_id}/day", response_model=Optional[PensionerConsumptionResponseDTO])
async def get_pensioner_day(
    pensioner_id: int,
    target_date: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Retorna el consumo de un pensionista en una fecha específica.
    Retorna null si no existe registro para esa fecha.
    """
    repo = SQLAlchemyPensionerConsumptionRepository(db)
    return await repo.get_by_pensioner_and_date(pensioner_id, target_date)


@router.get("/police/{police_id}", response_model=List[PoliceConsumptionResponseDTO])
async def get_police_history(
    police_id: int,
    month: str = Query(..., description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Retorna el historial de consumo de un policía para un mes dado.
    """
    repo = SQLAlchemyPoliceConsumptionRepository(db)
    year, m = map(int, month.split("-"))
    from_date = date(year, m, 1)
    to_date = date(year, m, monthrange(year, m)[1])
    return await repo.get_history(police_id, from_date, to_date)


@router.get("/police/{police_id}/day", response_model=Optional[PoliceConsumptionResponseDTO])
async def get_police_day(
    police_id: int,
    target_date: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """
    Retorna el consumo de un policía en una fecha específica.
    Retorna null si no existe registro para esa fecha.
    """
    repo = SQLAlchemyPoliceConsumptionRepository(db)
    return await repo.get_by_police_and_date(police_id, target_date)



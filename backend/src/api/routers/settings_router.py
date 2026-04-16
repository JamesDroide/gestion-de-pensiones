"""
Router de la API para configuración de precios del sistema.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.session import get_db
from src.infrastructure.repositories.pricing_config_repository_impl import SQLAlchemyPricingConfigRepository
from src.application.dtos.pricing_dtos import PricingConfigResponseDTO, PricingConfigUpdateDTO
from src.api.dependencies.auth import get_current_user, require_admin
from src.infrastructure.database.models.user_model import UserModel

router = APIRouter(prefix="/settings", tags=["Configuración"])


@router.get("/pricing", response_model=PricingConfigResponseDTO)
async def get_pricing(
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna la configuración de precios vigente del sistema."""
    repo = SQLAlchemyPricingConfigRepository(db)
    config = await repo.get_current()
    return config


@router.patch("/pricing", response_model=PricingConfigResponseDTO)
async def update_pricing(
    dto: PricingConfigUpdateDTO,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_admin),
):
    """
    Actualiza parcialmente la configuración de precios.
    Solo administradores pueden modificar precios.
    Los cambios NO afectan consumos históricos ya cerrados.
    """
    repo = SQLAlchemyPricingConfigRepository(db)
    config = await repo.get_current()

    # Aplicar solo los campos provistos (PATCH parcial)
    if dto.menu_price is not None:
        config.menu_price = dto.menu_price
    if dto.menu_price_normal is not None:
        config.menu_price_normal = dto.menu_price_normal
    if dto.menu_price_2_meals is not None:
        config.menu_price_2_meals = dto.menu_price_2_meals
    if dto.menu_price_3_meals is not None:
        config.menu_price_3_meals = dto.menu_price_3_meals
    if dto.breakfast_ticket_value is not None:
        config.breakfast_ticket_value = dto.breakfast_ticket_value
    if dto.lunch_ticket_value is not None:
        config.lunch_ticket_value = dto.lunch_ticket_value
    if dto.dinner_price is not None:
        config.dinner_price = dto.dinner_price
    if dto.dinner_ticket_equivalence is not None:
        config.dinner_ticket_equivalence = dto.dinner_ticket_equivalence

    # Registrar quién realizó el cambio
    config.updated_by = current_user.id

    return await repo.update(config)

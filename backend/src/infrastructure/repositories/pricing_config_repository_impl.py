"""
Implementación SQLAlchemy del repositorio de configuración de precios.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.pricing_config import PricingConfig
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.infrastructure.database.models.pricing_config_model import PricingConfigModel
from fastapi import HTTPException, status


class SQLAlchemyPricingConfigRepository(PricingConfigRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PricingConfigModel) -> PricingConfig:
        """Convierte modelo ORM a entidad de dominio."""
        return PricingConfig(
            id=model.id,
            menu_price=model.menu_price,
            menu_price_normal=model.menu_price_normal,
            menu_price_2_meals=model.menu_price_2_meals,
            menu_price_3_meals=model.menu_price_3_meals,
            breakfast_ticket_value=model.breakfast_ticket_value,
            lunch_ticket_value=model.lunch_ticket_value,
            dinner_price=model.dinner_price,
            dinner_ticket_equivalence=model.dinner_ticket_equivalence,
            updated_at=model.updated_at,
            updated_by=model.updated_by,
        )

    async def get_current(self) -> PricingConfig:
        """
        Retorna la configuración de precios vigente.
        Lanza 404 si no hay ninguna configuración en la BD.
        """
        stmt = select(PricingConfigModel).limit(1)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay configuración de precios registrada en el sistema",
            )
        return self._to_entity(model)

    async def update(self, config: PricingConfig) -> PricingConfig:
        """
        Actualiza la configuración de precios.
        NO afecta registros históricos ya cerrados.
        """
        model = await self._session.get(PricingConfigModel, config.id)
        if not model:
            raise ValueError(f"Configuración de precios con ID {config.id} no encontrada")
        model.menu_price = config.menu_price
        model.menu_price_normal = config.menu_price_normal
        model.menu_price_2_meals = config.menu_price_2_meals
        model.menu_price_3_meals = config.menu_price_3_meals
        model.breakfast_ticket_value = config.breakfast_ticket_value
        model.lunch_ticket_value = config.lunch_ticket_value
        model.dinner_price = config.dinner_price
        model.dinner_ticket_equivalence = config.dinner_ticket_equivalence
        model.updated_by = config.updated_by
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

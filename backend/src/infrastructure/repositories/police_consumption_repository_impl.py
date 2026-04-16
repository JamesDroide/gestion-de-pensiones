"""
Implementación SQLAlchemy del repositorio de consumos de policías.
"""
from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.consumption import PoliceConsumption, ExtraItem
from src.domain.repositories.consumption_repository import PoliceConsumptionRepository
from src.infrastructure.database.models.consumption_model import PoliceConsumptionModel, ExtraConsumptionModel


class SQLAlchemyPoliceConsumptionRepository(PoliceConsumptionRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PoliceConsumptionModel) -> PoliceConsumption:
        """Convierte modelo ORM a entidad de dominio, incluyendo extras individuales."""
        extras = [
            ExtraItem(
                dish_name=e.dish_name,
                unit_price_snapshot=e.unit_price_snapshot,
                quantity=e.quantity,
                subtotal=e.subtotal,
            )
            for e in (model.extras or [])
        ]
        return PoliceConsumption(
            id=model.id,
            police_id=model.police_id,
            date=model.date,
            breakfast_count=model.breakfast_count or 0,
            lunch_count=model.lunch_count or 0,
            dinner_count=model.dinner_count or 0,
            breakfast_ticket_value_snapshot=model.breakfast_ticket_value_snapshot or Decimal("0.00"),
            lunch_ticket_value_snapshot=model.lunch_ticket_value_snapshot or Decimal("0.00"),
            dinner_price_snapshot=model.dinner_price_snapshot or Decimal("0.00"),
            extras_total=model.extras_total or Decimal("0.00"),
            extras=extras,
            total=model.total or Decimal("0.00"),
            created_at=model.created_at,
        )

    async def get_by_id(self, consumption_id: int) -> Optional[PoliceConsumption]:
        result = await self._session.get(PoliceConsumptionModel, consumption_id)
        return self._to_entity(result) if result else None

    async def get_by_police_and_date(self, police_id: int, target_date: date) -> Optional[PoliceConsumption]:
        stmt = select(PoliceConsumptionModel).where(
            PoliceConsumptionModel.police_id == police_id,
            PoliceConsumptionModel.date == target_date,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_history(self, police_id: int, from_date: date, to_date: date) -> list[PoliceConsumption]:
        stmt = select(PoliceConsumptionModel).where(
            PoliceConsumptionModel.police_id == police_id,
            PoliceConsumptionModel.date >= from_date,
            PoliceConsumptionModel.date <= to_date,
        ).order_by(PoliceConsumptionModel.date.asc())
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, consumption: PoliceConsumption) -> PoliceConsumption:
        """Persiste un nuevo consumo de policía con sus extras individuales."""
        extras_total = sum(e.subtotal for e in consumption.extras) if consumption.extras else Decimal("0.00")
        model = PoliceConsumptionModel(
            police_id=consumption.police_id,
            date=consumption.date,
            breakfast_count=consumption.breakfast_count,
            lunch_count=consumption.lunch_count,
            dinner_count=consumption.dinner_count,
            breakfast_ticket_value_snapshot=consumption.breakfast_ticket_value_snapshot,
            lunch_ticket_value_snapshot=consumption.lunch_ticket_value_snapshot,
            dinner_price_snapshot=consumption.dinner_price_snapshot,
            extras_total=extras_total,
            total=consumption.total,
        )
        self._session.add(model)
        await self._session.flush()

        for extra in consumption.extras:
            self._session.add(ExtraConsumptionModel(
                dish_name=extra.dish_name,
                unit_price_snapshot=extra.unit_price_snapshot,
                quantity=extra.quantity,
                subtotal=extra.subtotal,
                police_consumption_id=model.id,
            ))

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, consumption: PoliceConsumption) -> PoliceConsumption:
        """Actualiza comidas, precios y reemplaza los extras del consumo."""
        model = await self._session.get(PoliceConsumptionModel, consumption.id)
        if not model:
            raise ValueError(f"Consumo de policía con ID {consumption.id} no encontrado")

        model.breakfast_count = consumption.breakfast_count
        model.lunch_count = consumption.lunch_count
        model.dinner_count = consumption.dinner_count
        model.breakfast_ticket_value_snapshot = consumption.breakfast_ticket_value_snapshot
        model.lunch_ticket_value_snapshot = consumption.lunch_ticket_value_snapshot
        model.dinner_price_snapshot = consumption.dinner_price_snapshot
        model.total = consumption.total

        await self._session.execute(
            delete(ExtraConsumptionModel).where(
                ExtraConsumptionModel.police_consumption_id == consumption.id
            )
        )
        extras_total = Decimal("0.00")
        for extra in consumption.extras:
            extras_total += extra.subtotal
            self._session.add(ExtraConsumptionModel(
                dish_name=extra.dish_name,
                unit_price_snapshot=extra.unit_price_snapshot,
                quantity=extra.quantity,
                subtotal=extra.subtotal,
                police_consumption_id=model.id,
            ))
        model.extras_total = extras_total

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

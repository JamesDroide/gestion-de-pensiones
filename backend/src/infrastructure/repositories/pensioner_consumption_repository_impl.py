"""
Implementación SQLAlchemy del repositorio de consumos de pensionistas.
"""
from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.consumption import PensionerConsumption, ExtraItem
from src.domain.repositories.consumption_repository import PensionerConsumptionRepository
from src.infrastructure.database.models.consumption_model import PensionerConsumptionModel, ExtraConsumptionModel


class SQLAlchemyPensionerConsumptionRepository(PensionerConsumptionRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PensionerConsumptionModel) -> PensionerConsumption:
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
        return PensionerConsumption(
            id=model.id,
            pensioner_id=model.pensioner_id,
            date=model.date,
            breakfast_count=model.breakfast_count or 0,
            lunch_count=model.lunch_count or 0,
            dinner_count=model.dinner_count or 0,
            extras_total=model.extras_total or Decimal("0.00"),
            extras=extras,
            unit_price_snapshot=model.unit_price_snapshot,
            total_price=model.total_price,
            is_closed=bool(model.is_closed),
            created_at=model.created_at,
        )

    async def get_by_id(self, consumption_id: int) -> Optional[PensionerConsumption]:
        """Obtiene un consumo de pensionista por su ID."""
        result = await self._session.get(PensionerConsumptionModel, consumption_id)
        return self._to_entity(result) if result else None

    async def get_by_pensioner_and_date(self, pensioner_id: int, target_date: date) -> Optional[PensionerConsumption]:
        """Retorna el consumo de un pensionista en una fecha específica."""
        stmt = select(PensionerConsumptionModel).where(
            PensionerConsumptionModel.pensioner_id == pensioner_id,
            PensionerConsumptionModel.date == target_date,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_open_by_date(self, target_date: date) -> list[PensionerConsumption]:
        """Retorna todos los consumos de pensionistas abiertos de una fecha."""
        stmt = select(PensionerConsumptionModel).where(
            PensionerConsumptionModel.date == target_date,
            PensionerConsumptionModel.is_closed == False,
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_history(self, pensioner_id: int, from_date: date, to_date: date) -> list[PensionerConsumption]:
        """Retorna el historial de consumos de un pensionista en un rango de fechas."""
        stmt = select(PensionerConsumptionModel).where(
            PensionerConsumptionModel.pensioner_id == pensioner_id,
            PensionerConsumptionModel.date >= from_date,
            PensionerConsumptionModel.date <= to_date,
        ).order_by(PensionerConsumptionModel.date.asc())
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, consumption: PensionerConsumption) -> PensionerConsumption:
        """Persiste un nuevo consumo de pensionista con sus extras individuales."""
        extras_total = sum(e.subtotal for e in consumption.extras) if consumption.extras else Decimal("0.00")
        model = PensionerConsumptionModel(
            pensioner_id=consumption.pensioner_id,
            date=consumption.date,
            breakfast_count=consumption.breakfast_count,
            lunch_count=consumption.lunch_count,
            dinner_count=consumption.dinner_count,
            extras_total=extras_total,
        )
        self._session.add(model)
        await self._session.flush()

        for extra in consumption.extras:
            self._session.add(ExtraConsumptionModel(
                dish_name=extra.dish_name,
                unit_price_snapshot=extra.unit_price_snapshot,
                quantity=extra.quantity,
                subtotal=extra.subtotal,
                pensioner_consumption_id=model.id,
            ))

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, consumption: PensionerConsumption) -> PensionerConsumption:
        """Actualiza comidas, cierre y reemplaza los extras del consumo."""
        model = await self._session.get(PensionerConsumptionModel, consumption.id)
        if not model:
            raise ValueError(f"Consumo de pensionista con ID {consumption.id} no encontrado")
        model.breakfast_count = consumption.breakfast_count
        model.lunch_count = consumption.lunch_count
        model.dinner_count = consumption.dinner_count
        model.unit_price_snapshot = consumption.unit_price_snapshot
        model.total_price = consumption.total_price
        model.is_closed = consumption.is_closed

        # Reemplazar extras: eliminar los existentes e insertar los nuevos
        await self._session.execute(
            delete(ExtraConsumptionModel).where(
                ExtraConsumptionModel.pensioner_consumption_id == consumption.id
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
                pensioner_consumption_id=model.id,
            ))
        model.extras_total = extras_total

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

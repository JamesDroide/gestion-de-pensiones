"""
Implementación SQLAlchemy del repositorio de pagos.
"""
from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.payment import Payment, PaymentType
from src.domain.repositories.payment_repository import PaymentRepository
from src.infrastructure.database.models.payment_model import PaymentModel


class SQLAlchemyPaymentRepository(PaymentRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PaymentModel) -> Payment:
        return Payment(
            id=model.id,
            amount=model.amount,
            payment_type=model.payment_type,
            pensioner_id=model.pensioner_id,
            police_id=model.police_id,
            description=model.description,
            created_at=model.created_at,
            discount_type=model.discount_type,
            discount_value=model.discount_value,
            discount_amount=model.discount_amount if model.discount_amount is not None else Decimal("0.00"),
        )

    async def get_by_id(self, payment_id: int) -> Optional[Payment]:
        result = await self._session.get(PaymentModel, payment_id)
        return self._to_entity(result) if result else None

    async def get_by_pensioner(
        self,
        pensioner_id: int,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> list[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.pensioner_id == pensioner_id)
        if from_date:
            stmt = stmt.where(func.date(PaymentModel.created_at) >= from_date)
        if to_date:
            stmt = stmt.where(func.date(PaymentModel.created_at) <= to_date)
        stmt = stmt.order_by(PaymentModel.created_at.desc())
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_police(
        self,
        police_id: int,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> list[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.police_id == police_id)
        if from_date:
            stmt = stmt.where(func.date(PaymentModel.created_at) >= from_date)
        if to_date:
            stmt = stmt.where(func.date(PaymentModel.created_at) <= to_date)
        stmt = stmt.order_by(PaymentModel.created_at.desc())
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, payment: Payment) -> Payment:
        model = PaymentModel(
            amount=payment.amount,
            payment_type=payment.payment_type,
            pensioner_id=payment.pensioner_id,
            police_id=payment.police_id,
            description=payment.description,
            discount_type=payment.discount_type,
            discount_value=payment.discount_value,
            discount_amount=payment.discount_amount,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_total_debt_by_pensioner(self, pensioner_id: int) -> Decimal:
        """Retorna la suma de todos los pagos registrados para este pensionista."""
        stmt = select(func.coalesce(func.sum(PaymentModel.amount), 0)).where(
            PaymentModel.pensioner_id == pensioner_id
        )
        result = await self._session.execute(stmt)
        return Decimal(str(result.scalar()))

    async def get_total_debt_by_police(self, police_id: int) -> Decimal:
        """Retorna la suma de todos los pagos registrados para este policía."""
        stmt = select(func.coalesce(func.sum(PaymentModel.amount), 0)).where(
            PaymentModel.police_id == police_id
        )
        result = await self._session.execute(stmt)
        return Decimal(str(result.scalar()))

    async def get_monthly_total(self, from_date: date, to_date: date, pensionista_type: str | None = None) -> Decimal:
        """Suma total de pagos en el rango. Filtra por civil o police si se indica."""
        stmt = select(func.coalesce(func.sum(PaymentModel.amount), 0)).where(
            func.date(PaymentModel.created_at) >= from_date,
            func.date(PaymentModel.created_at) <= to_date,
        )
        if pensionista_type == 'civil':
            stmt = stmt.where(PaymentModel.pensioner_id.isnot(None))
        elif pensionista_type == 'police':
            stmt = stmt.where(PaymentModel.police_id.isnot(None))
        result = await self._session.execute(stmt)
        return Decimal(str(result.scalar()))

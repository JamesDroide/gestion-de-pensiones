"""
Caso de uso: Listar policías activos con su deuda calculada para el mes actual.
El total de cada consumo ya viene guardado (snapshot) en la BD.
"""
import calendar
from datetime import date
from decimal import Decimal
from src.domain.repositories.police_repository import PoliceRepository
from src.domain.repositories.consumption_repository import PoliceConsumptionRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.application.dtos.payment_dtos import PoliceWithDebtDTO


class ListPoliceWithDebtUseCase:

    def __init__(
        self,
        police_repo: PoliceRepository,
        consumption_repo: PoliceConsumptionRepository,
        payment_repo: PaymentRepository,
    ):
        self._police_repo = police_repo
        self._consumption_repo = consumption_repo
        self._payment_repo = payment_repo

    async def execute(self, month: str) -> list[PoliceWithDebtDTO]:
        year, mon = map(int, month.split("-"))
        from_date = date(year, mon, 1)
        to_date = date(year, mon, calendar.monthrange(year, mon)[1])

        officers = await self._police_repo.get_all(skip=0, limit=500, active_only=True)
        result: list[PoliceWithDebtDTO] = []

        for officer in officers:
            consumptions = await self._consumption_repo.get_history(officer.id, from_date, to_date)
            payments = await self._payment_repo.get_by_police(officer.id, from_date, to_date)

            total_consumed = sum(c.total for c in consumptions) if consumptions else Decimal("0.00")
            total_paid = sum(p.amount for p in payments) if payments else Decimal("0.00")
            debt_balance = total_consumed - total_paid

            last_payment = payments[0] if payments else None

            result.append(PoliceWithDebtDTO(
                police_id=officer.id,
                full_name=officer.full_name,
                badge_code=officer.badge_code,
                rank=officer.rank,
                phone=officer.phone,
                debt_balance=debt_balance,
                last_payment_date=last_payment.created_at if last_payment else None,
                last_payment_amount=last_payment.amount if last_payment else None,
                status="paid" if debt_balance <= Decimal("0.00") else "debt",
            ))

        return result

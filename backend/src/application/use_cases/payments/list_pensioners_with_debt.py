"""
Caso de uso: Listar pensionistas activos con su deuda calculada para el mes actual.
"""
import calendar
from datetime import date
from decimal import Decimal
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.domain.repositories.consumption_repository import PensionerConsumptionRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.application.dtos.payment_dtos import PensionerWithDebtDTO


def _calc_meal_cost(c, pricing, no_pension_rules: bool = False) -> Decimal:
    if no_pension_rules:
        total_portions = c.breakfast_count + c.lunch_count + c.dinner_count
        return pricing.menu_price * total_portions
    unique = sum([c.has_breakfast, c.has_lunch, c.has_dinner])
    if unique == 0:
        return Decimal("0.00")
    if unique == 1:
        return pricing.menu_price_normal
    if unique == 2:
        return pricing.menu_price_2_meals * 2
    return pricing.menu_price_3_meals * 3


class ListPensionersWithDebtUseCase:

    def __init__(
        self,
        pensioner_repo: PensionerRepository,
        consumption_repo: PensionerConsumptionRepository,
        payment_repo: PaymentRepository,
        pricing_repo: PricingConfigRepository,
    ):
        self._pensioner_repo = pensioner_repo
        self._consumption_repo = consumption_repo
        self._payment_repo = payment_repo
        self._pricing_repo = pricing_repo

    async def execute(self, month: str) -> list[PensionerWithDebtDTO]:
        """
        month: 'YYYY-MM' — mes para calcular la deuda.
        Retorna todos los pensionistas activos ordenados alfabéticamente.
        """
        year, mon = map(int, month.split("-"))
        from_date = date(year, mon, 1)
        to_date = date(year, mon, calendar.monthrange(year, mon)[1])

        pensioners = await self._pensioner_repo.get_all(skip=0, limit=500, active_only=True)
        pricing = await self._pricing_repo.get_current()

        result: list[PensionerWithDebtDTO] = []

        for pensioner in pensioners:
            consumptions = await self._consumption_repo.get_history(pensioner.id, from_date, to_date)
            payments = await self._payment_repo.get_by_pensioner(pensioner.id, from_date, to_date)

            total_consumed = Decimal("0.00")
            for c in consumptions:
                if c.total_price is not None:
                    total_consumed += c.total_price
                else:
                    total_consumed += _calc_meal_cost(c, pricing, pensioner.no_pension_rules) + c.extras_total

            total_paid = sum(p.amount for p in payments) if payments else Decimal("0.00")
            debt_balance = total_consumed - total_paid

            last_payment = payments[0] if payments else None

            result.append(PensionerWithDebtDTO(
                pensioner_id=pensioner.id,
                full_name=pensioner.full_name,
                id_code=pensioner.id_code,
                payment_mode=pensioner.payment_mode.value,
                phone=pensioner.phone,
                debt_balance=debt_balance,
                last_payment_date=last_payment.created_at if last_payment else None,
                last_payment_amount=last_payment.amount if last_payment else None,
                status="paid" if debt_balance <= Decimal("0.00") else "debt",
            ))

        return result

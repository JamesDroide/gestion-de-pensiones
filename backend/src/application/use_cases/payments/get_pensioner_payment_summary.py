"""
Caso de uso: Obtener resumen de cobro de un pensionista para un mes dado.
Calcula el total consumido (con precios de config para registros abiertos),
el total pagado y la deuda resultante.
"""
import calendar
from datetime import date
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.domain.repositories.consumption_repository import PensionerConsumptionRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.application.dtos.payment_dtos import (
    PensionerPaymentSummaryDTO,
    ConsumptionDayDTO,
    PaymentRecordDTO,
)
from src.application.dtos.consumption_dtos import ExtraItemDTO
from src.application.helpers.meal_cost import calc_meal_cost


class GetPensionerPaymentSummaryUseCase:

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

    async def execute(self, pensioner_id: int, month: str) -> PensionerPaymentSummaryDTO:
        """
        month: 'YYYY-MM'
        """
        pensioner = await self._pensioner_repo.get_by_id(pensioner_id)
        if not pensioner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pensionista no encontrado")

        year, mon = map(int, month.split("-"))
        from_date = date(year, mon, 1)
        to_date = date(year, mon, calendar.monthrange(year, mon)[1])

        pricing = await self._pricing_repo.get_current()
        consumptions = await self._consumption_repo.get_history(pensioner_id, from_date, to_date)
        payments = await self._payment_repo.get_by_pensioner(pensioner_id, from_date, to_date)

        consumption_days: list[ConsumptionDayDTO] = []
        total_consumed = Decimal("0.00")

        for c in consumptions:
            if c.total_price is not None:
                daily_total = c.total_price
            else:
                daily_total = calc_meal_cost(
                    breakfast=c.breakfast_count,
                    lunch=c.lunch_count,
                    dinner=c.dinner_count,
                    extras_total=c.extras_total,
                    no_pension_rules=pensioner.no_pension_rules,
                    no_pension_price_mode=pensioner.no_pension_price_mode,
                    menu_price=pricing.menu_price,
                    menu_price_normal=pricing.menu_price_normal,
                    menu_price_2_meals=pricing.menu_price_2_meals,
                    menu_price_3_meals=pricing.menu_price_3_meals,
                    custom_price_1_meal=pensioner.custom_price_1_meal,
                    custom_price_2_meals=pensioner.custom_price_2_meals,
                    custom_price_3_meals=pensioner.custom_price_3_meals,
                    custom_breakfast_price=pensioner.custom_breakfast_price,
                    custom_lunch_price=pensioner.custom_lunch_price,
                    custom_dinner_price=pensioner.custom_dinner_price,
                )

            total_consumed += daily_total
            consumption_days.append(ConsumptionDayDTO(
                id=c.id,
                date=c.date,
                breakfast_count=c.breakfast_count,
                lunch_count=c.lunch_count,
                dinner_count=c.dinner_count,
                has_breakfast=c.has_breakfast,
                has_lunch=c.has_lunch,
                has_dinner=c.has_dinner,
                meal_count=c.meal_count,
                extras_total=c.extras_total,
                extras=[
                    ExtraItemDTO(
                        dish_name=e.dish_name,
                        unit_price_snapshot=e.unit_price_snapshot,
                        quantity=e.quantity,
                        subtotal=e.subtotal,
                    )
                    for e in c.extras
                ],
                daily_total=daily_total,
                is_closed=c.is_closed,
            ))

        total_paid = sum(p.amount for p in payments) if payments else Decimal("0.00")
        total_discount = sum(p.discount_amount for p in payments) if payments else Decimal("0.00")
        debt_balance = total_consumed - total_paid - total_discount

        payment_records = [
            PaymentRecordDTO(
                id=p.id,
                amount=p.amount,
                payment_type=p.payment_type.value,
                description=p.description,
                created_at=p.created_at,
                discount_type=p.discount_type,
                discount_value=p.discount_value,
                discount_amount=p.discount_amount,
            )
            for p in payments
        ]

        return PensionerPaymentSummaryDTO(
            pensioner_id=pensioner.id,
            full_name=pensioner.full_name,
            id_code=pensioner.id_code,
            payment_mode=pensioner.payment_mode.value,
            month=month,
            consumptions=consumption_days,
            total_consumed=total_consumed,
            total_paid=total_paid,
            debt_balance=debt_balance,
            payments=payment_records,
        )

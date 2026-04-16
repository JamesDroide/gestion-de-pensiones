"""
Caso de uso: Resumen de cobro de un policía para un mes dado.
Incluye desglose de menú vs extras y los precios vigentes de tickets.
"""
import calendar
from datetime import date
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.repositories.police_repository import PoliceRepository
from src.domain.repositories.consumption_repository import PoliceConsumptionRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.application.dtos.payment_dtos import (
    PolicePaymentSummaryDTO,
    PoliceConsumptionDayDTO,
    PaymentRecordDTO,
)
from src.application.dtos.consumption_dtos import ExtraItemDTO


class GetPolicePaymentSummaryUseCase:

    def __init__(
        self,
        police_repo: PoliceRepository,
        consumption_repo: PoliceConsumptionRepository,
        payment_repo: PaymentRepository,
        pricing_repo: PricingConfigRepository,
    ):
        self._police_repo = police_repo
        self._consumption_repo = consumption_repo
        self._payment_repo = payment_repo
        self._pricing_repo = pricing_repo

    async def execute(self, police_id: int, month: str) -> PolicePaymentSummaryDTO:
        officer = await self._police_repo.get_by_id(police_id)
        if not officer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policía no encontrado")

        year, mon = map(int, month.split("-"))
        from_date = date(year, mon, 1)
        to_date = date(year, mon, calendar.monthrange(year, mon)[1])

        pricing = await self._pricing_repo.get_current()
        consumptions = await self._consumption_repo.get_history(police_id, from_date, to_date)
        payments = await self._payment_repo.get_by_police(police_id, from_date, to_date)

        consumption_days: list[PoliceConsumptionDayDTO] = []
        total_menus = Decimal("0.00")
        total_extras = Decimal("0.00")

        for c in consumptions:
            # Precio total = precio_unitario × cantidad de porciones
            bf_val = c.breakfast_ticket_value_snapshot * c.breakfast_count
            lu_val = c.lunch_ticket_value_snapshot * c.lunch_count
            di_val = c.dinner_price_snapshot * c.dinner_count
            menu_total = bf_val + lu_val + di_val

            total_menus += menu_total
            total_extras += c.extras_total

            consumption_days.append(PoliceConsumptionDayDTO(
                id=c.id,
                date=c.date,
                breakfast_count=c.breakfast_count,
                lunch_count=c.lunch_count,
                dinner_count=c.dinner_count,
                has_breakfast=c.has_breakfast,
                has_lunch=c.has_lunch,
                has_dinner=c.has_dinner,
                breakfast_value=c.breakfast_ticket_value_snapshot,
                lunch_value=c.lunch_ticket_value_snapshot,
                dinner_value=c.dinner_price_snapshot,
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
                menu_total=menu_total,
                daily_total=c.total,
            ))

        total_consumed = total_menus + total_extras
        total_paid = sum(p.amount for p in payments) if payments else Decimal("0.00")
        debt_balance = total_consumed - total_paid

        payment_records = [
            PaymentRecordDTO(
                id=p.id,
                amount=p.amount,
                payment_type=p.payment_type.value,
                description=p.description,
                created_at=p.created_at,
            )
            for p in payments
        ]

        return PolicePaymentSummaryDTO(
            police_id=officer.id,
            full_name=officer.full_name,
            badge_code=officer.badge_code,
            rank=officer.rank,
            month=month,
            consumptions=consumption_days,
            total_menus=total_menus,
            total_extras=total_extras,
            total_consumed=total_consumed,
            total_paid=total_paid,
            debt_balance=debt_balance,
            payments=payment_records,
            current_breakfast_ticket_value=pricing.breakfast_ticket_value,
            current_lunch_ticket_value=pricing.lunch_ticket_value,
        )

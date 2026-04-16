"""
Caso de uso: Registrar un pago de un policía.
Soporta efectivo, Yape y tickets físicos.
Con tickets: calcula el valor según precio vigente de cada tipo.
"""
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.entities.payment import Payment
from src.domain.repositories.police_repository import PoliceRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.application.dtos.payment_dtos import RegisterPolicePaymentDTO, PaymentRecordDTO
from src.domain.entities.payment import PaymentType


class RegisterPolicePaymentUseCase:

    def __init__(
        self,
        police_repo: PoliceRepository,
        payment_repo: PaymentRepository,
        pricing_repo: PricingConfigRepository,
    ):
        self._police_repo = police_repo
        self._payment_repo = payment_repo
        self._pricing_repo = pricing_repo

    async def execute(self, police_id: int, dto: RegisterPolicePaymentDTO) -> PaymentRecordDTO:
        officer = await self._police_repo.get_by_id(police_id)
        if not officer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policía no encontrado")

        if dto.payment_type == PaymentType.TICKETS:
            pricing = await self._pricing_repo.get_current()

            bf_value = pricing.breakfast_ticket_value * Decimal(str(dto.breakfast_tickets))
            lu_value = pricing.lunch_ticket_value * Decimal(str(dto.lunch_tickets))
            ticket_total = bf_value + lu_value

            if ticket_total <= Decimal("0.00"):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Ingresa al menos 1 ticket de desayuno o almuerzo",
                )

            amount = ticket_total
            parts = []
            if dto.breakfast_tickets > 0:
                parts.append(f"{dto.breakfast_tickets} desayuno (S/{bf_value:.2f})")
            if dto.lunch_tickets > 0:
                parts.append(f"{dto.lunch_tickets} almuerzo (S/{lu_value:.2f})")
            description = dto.description or f"Tickets: {' + '.join(parts)}"

        else:
            if not dto.amount or dto.amount <= Decimal("0.00"):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El monto del pago debe ser mayor a cero",
                )
            amount = dto.amount
            description = dto.description

        payment = await self._payment_repo.create(Payment(
            id=0,
            amount=amount,
            payment_type=dto.payment_type,
            police_id=police_id,
            description=description,
        ))

        return PaymentRecordDTO(
            id=payment.id,
            amount=payment.amount,
            payment_type=payment.payment_type.value,
            description=payment.description,
            created_at=payment.created_at,
        )

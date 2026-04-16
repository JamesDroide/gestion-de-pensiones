"""
Caso de uso: Registrar un pago de un pensionista.
"""
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.entities.payment import Payment
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.domain.repositories.payment_repository import PaymentRepository
from src.application.dtos.payment_dtos import RegisterPaymentDTO, PaymentRecordDTO


class RegisterPensionerPaymentUseCase:

    def __init__(
        self,
        pensioner_repo: PensionerRepository,
        payment_repo: PaymentRepository,
    ):
        self._pensioner_repo = pensioner_repo
        self._payment_repo = payment_repo

    async def execute(self, pensioner_id: int, dto: RegisterPaymentDTO) -> PaymentRecordDTO:
        pensioner = await self._pensioner_repo.get_by_id(pensioner_id)
        if not pensioner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pensionista no encontrado")

        if dto.amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El monto del pago debe ser mayor a cero",
            )

        payment = await self._payment_repo.create(Payment(
            id=0,
            amount=dto.amount,
            payment_type=dto.payment_type,
            pensioner_id=pensioner_id,
            description=dto.description,
        ))

        return PaymentRecordDTO(
            id=payment.id,
            amount=payment.amount,
            payment_type=payment.payment_type.value,
            description=payment.description,
            created_at=payment.created_at,
        )

"""
Caso de uso: Registrar o actualizar consumo diario de un pensionista.
Un pensionista solo puede tener un registro por fecha — si ya existe se actualiza.
Solo pensionistas con no_pension_rules=True pueden tener count > 1 por comida.
"""
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.entities.consumption import PensionerConsumption, ExtraItem
from src.domain.repositories.consumption_repository import PensionerConsumptionRepository
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.application.dtos.consumption_dtos import RegisterPensionerConsumptionDTO


class RegisterPensionerConsumptionUseCase:
    def __init__(
        self,
        consumption_repo: PensionerConsumptionRepository,
        pensioner_repo: PensionerRepository,
    ):
        self._consumption_repo = consumption_repo
        self._pensioner_repo = pensioner_repo

    async def execute(self, dto: RegisterPensionerConsumptionDTO) -> PensionerConsumption:
        """
        Registra o actualiza el consumo del día para un pensionista.
        Para civiles con reglas normales los counts se limitan a 1 máximo.
        """
        pensioner = await self._pensioner_repo.get_by_id(dto.pensioner_id)
        if not pensioner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pensionista no encontrado",
            )

        # Civiles normales no pueden tener >1 porción por comida
        if not pensioner.no_pension_rules:
            breakfast_count = min(dto.breakfast_count, 1)
            lunch_count = min(dto.lunch_count, 1)
            dinner_count = min(dto.dinner_count, 1)
        else:
            breakfast_count = max(0, dto.breakfast_count)
            lunch_count = max(0, dto.lunch_count)
            dinner_count = max(0, dto.dinner_count)

        extras = [
            ExtraItem(
                dish_name=e.dish_name,
                unit_price_snapshot=e.unit_price,
                quantity=e.quantity,
                subtotal=e.unit_price * Decimal(str(e.quantity)),
            )
            for e in dto.extras
        ]

        existing = await self._consumption_repo.get_by_pensioner_and_date(dto.pensioner_id, dto.date)

        if existing:
            if existing.is_closed:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El consumo de este día ya fue cerrado y no puede modificarse",
                )
            existing.breakfast_count = breakfast_count
            existing.lunch_count = lunch_count
            existing.dinner_count = dinner_count
            existing.extras = extras
            return await self._consumption_repo.update(existing)

        consumption = PensionerConsumption(
            id=0,
            pensioner_id=dto.pensioner_id,
            date=dto.date,
            breakfast_count=breakfast_count,
            lunch_count=lunch_count,
            dinner_count=dinner_count,
            extras=extras,
        )
        return await self._consumption_repo.create(consumption)

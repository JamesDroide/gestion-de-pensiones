"""
Caso de uso: Registrar o actualizar consumo diario de un pensionista policía.
El total se calcula directamente: count × precio_unitario por cada comida.
"""
from decimal import Decimal
from fastapi import HTTPException, status
from src.domain.entities.consumption import PoliceConsumption, ExtraItem
from src.domain.repositories.consumption_repository import PoliceConsumptionRepository
from src.domain.repositories.police_repository import PoliceRepository
from src.domain.repositories.pricing_config_repository import PricingConfigRepository
from src.application.dtos.consumption_dtos import RegisterPoliceConsumptionDTO


class RegisterPoliceConsumptionUseCase:
    def __init__(
        self,
        consumption_repo: PoliceConsumptionRepository,
        police_repo: PoliceRepository,
        pricing_repo: PricingConfigRepository,
    ):
        self._consumption_repo = consumption_repo
        self._police_repo = police_repo
        self._pricing_repo = pricing_repo

    async def execute(self, dto: RegisterPoliceConsumptionDTO) -> PoliceConsumption:
        """
        Registra o actualiza el consumo del día de un policía.
        Total = (breakfast_count × precio_desayuno) + (lunch_count × precio_almuerzo)
                + (dinner_count × precio_cena) + extras_total
        """
        police = await self._police_repo.get_by_id(dto.police_id)
        if not police:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policía no encontrado",
            )

        config = await self._pricing_repo.get_current()
        breakfast_val = config.breakfast_ticket_value
        lunch_val = config.lunch_ticket_value
        dinner_val = config.dinner_price

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
        extras_total = sum(e.subtotal for e in extras) if extras else Decimal("0.00")

        meal_total = (
            breakfast_val * breakfast_count +
            lunch_val     * lunch_count +
            dinner_val    * dinner_count
        )
        total = meal_total + extras_total

        existing = await self._consumption_repo.get_by_police_and_date(dto.police_id, dto.date)

        if existing:
            existing.breakfast_count = breakfast_count
            existing.lunch_count = lunch_count
            existing.dinner_count = dinner_count
            existing.breakfast_ticket_value_snapshot = breakfast_val
            existing.lunch_ticket_value_snapshot = lunch_val
            existing.dinner_price_snapshot = dinner_val
            existing.extras = extras
            existing.total = total
            return await self._consumption_repo.update(existing)

        consumption = PoliceConsumption(
            id=0,
            police_id=dto.police_id,
            date=dto.date,
            breakfast_count=breakfast_count,
            lunch_count=lunch_count,
            dinner_count=dinner_count,
            breakfast_ticket_value_snapshot=breakfast_val,
            lunch_ticket_value_snapshot=lunch_val,
            dinner_price_snapshot=dinner_val,
            extras=extras,
            total=total,
        )
        return await self._consumption_repo.create(consumption)

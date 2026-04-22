"""
Caso de uso: Registrar nuevo pensionista.
"""
from fastapi import HTTPException, status
from src.domain.entities.pensioner import Pensioner
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.application.dtos.pensioner_dtos import PensionerCreateDTO


class CreatePensionerUseCase:
    def __init__(self, repo: PensionerRepository):
        self._repo = repo

    async def execute(self, dto: PensionerCreateDTO) -> Pensioner:
        """
        Crea un nuevo pensionista.
        Valida que el código DNI no esté registrado previamente.
        """
        existing = await self._repo.get_by_id_code(dto.id_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un pensionista con el código '{dto.id_code}'",
            )
        pensioner = Pensioner(
            id=0,  # la BD asignará el ID real
            full_name=dto.full_name,
            id_code=dto.id_code,
            payment_mode=dto.payment_mode,
            no_pension_rules=dto.no_pension_rules,
            no_pension_price_mode=dto.no_pension_price_mode,
            phone=dto.phone,
            notes=dto.notes,
            custom_price_1_meal=dto.custom_price_1_meal,
            custom_price_2_meals=dto.custom_price_2_meals,
            custom_price_3_meals=dto.custom_price_3_meals,
            custom_breakfast_price=dto.custom_breakfast_price,
            custom_lunch_price=dto.custom_lunch_price,
            custom_dinner_price=dto.custom_dinner_price,
        )
        return await self._repo.create(pensioner)

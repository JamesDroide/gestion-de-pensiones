"""Caso de uso: Actualizar datos modificables de un pensionista."""
from fastapi import HTTPException, status
from src.domain.entities.pensioner import Pensioner
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.application.dtos.pensioner_dtos import PensionerUpdateDTO


class UpdatePensionerUseCase:
    def __init__(self, repo: PensionerRepository):
        self._repo = repo

    async def execute(self, pensioner_id: int, dto: PensionerUpdateDTO) -> Pensioner:
        """
        Actualiza los campos provistos en el DTO (PATCH parcial).
        Los campos None en el DTO se ignoran — no sobreescriben el valor existente.
        """
        pensioner = await self._repo.get_by_id(pensioner_id)
        if not pensioner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pensionista no encontrado",
            )
        if dto.full_name is not None:
            pensioner.full_name = dto.full_name
        if dto.payment_mode is not None:
            pensioner.payment_mode = dto.payment_mode
        if dto.no_pension_rules is not None:
            pensioner.no_pension_rules = dto.no_pension_rules
        if dto.phone is not None:
            pensioner.phone = dto.phone
        if dto.notes is not None:
            pensioner.notes = dto.notes
        return await self._repo.update(pensioner)

"""Caso de uso: Actualizar datos modificables de un pensionista policía."""
from fastapi import HTTPException, status
from src.domain.entities.police import Police
from src.domain.repositories.police_repository import PoliceRepository
from src.application.dtos.police_dtos import PoliceUpdateDTO


class UpdatePoliceUseCase:
    def __init__(self, repo: PoliceRepository):
        self._repo = repo

    async def execute(self, police_id: int, dto: PoliceUpdateDTO) -> Police:
        """
        Actualiza los campos provistos en el DTO (PATCH parcial).
        Los campos None en el DTO se ignoran — no sobreescriben el valor existente.
        """
        police = await self._repo.get_by_id(police_id)
        if not police:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policía no encontrado",
            )
        if dto.full_name is not None:
            police.full_name = dto.full_name
        if dto.rank is not None:
            police.rank = dto.rank
        if dto.phone is not None:
            police.phone = dto.phone
        if dto.notes is not None:
            police.notes = dto.notes
        return await self._repo.update(police)

"""
Caso de uso: Registrar nuevo pensionista policía.
"""
from fastapi import HTTPException, status
from src.domain.entities.police import Police
from src.domain.repositories.police_repository import PoliceRepository
from src.application.dtos.police_dtos import PoliceCreateDTO


class CreatePoliceUseCase:
    def __init__(self, repo: PoliceRepository):
        self._repo = repo

    async def execute(self, dto: PoliceCreateDTO) -> Police:
        """
        Crea un nuevo pensionista policía.
        Valida que la placa o código no esté registrado previamente.
        """
        existing = await self._repo.get_by_badge_code(dto.badge_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un policía con la placa '{dto.badge_code}'",
            )
        police = Police(
            id=0,  # la BD asignará el ID real
            full_name=dto.full_name,
            badge_code=dto.badge_code,
            rank=dto.rank,
            phone=dto.phone,
            notes=dto.notes,
        )
        return await self._repo.create(police)

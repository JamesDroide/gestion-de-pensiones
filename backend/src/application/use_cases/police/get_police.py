"""Caso de uso: Obtener un policía por su ID."""
from fastapi import HTTPException, status
from src.domain.entities.police import Police
from src.domain.repositories.police_repository import PoliceRepository


class GetPoliceUseCase:
    def __init__(self, repo: PoliceRepository):
        self._repo = repo

    async def execute(self, police_id: int) -> Police:
        """
        Obtiene un policía por su ID primario.
        Lanza HTTP 404 si no existe en el sistema.
        """
        police = await self._repo.get_by_id(police_id)
        if not police:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policía no encontrado",
            )
        return police

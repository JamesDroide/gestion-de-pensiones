"""Caso de uso: Obtener un pensionista por su ID."""
from fastapi import HTTPException, status
from src.domain.entities.pensioner import Pensioner
from src.domain.repositories.pensioner_repository import PensionerRepository


class GetPensionerUseCase:
    def __init__(self, repo: PensionerRepository):
        self._repo = repo

    async def execute(self, pensioner_id: int) -> Pensioner:
        """
        Obtiene un pensionista por su ID primario.
        Lanza HTTP 404 si no existe en el sistema.
        """
        pensioner = await self._repo.get_by_id(pensioner_id)
        if not pensioner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pensionista no encontrado",
            )
        return pensioner

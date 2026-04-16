"""Caso de uso: Listar pensionistas con paginación."""
from src.domain.entities.pensioner import Pensioner
from src.domain.repositories.pensioner_repository import PensionerRepository


class ListPensionersUseCase:
    def __init__(self, repo: PensionerRepository):
        self._repo = repo

    async def execute(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Pensioner]:
        """Retorna la lista paginada de pensionistas, opcionalmente solo los activos."""
        return await self._repo.get_all(skip=skip, limit=limit, active_only=active_only)

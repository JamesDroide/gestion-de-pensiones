"""Caso de uso: Listar pensionistas policías con paginación."""
from src.domain.entities.police import Police
from src.domain.repositories.police_repository import PoliceRepository


class ListPoliceUseCase:
    def __init__(self, repo: PoliceRepository):
        self._repo = repo

    async def execute(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Police]:
        """Retorna la lista paginada de policías, opcionalmente solo los activos."""
        return await self._repo.get_all(skip=skip, limit=limit, active_only=active_only)

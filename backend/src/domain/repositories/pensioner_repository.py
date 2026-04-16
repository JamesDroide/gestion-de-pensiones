"""
Interfaz del repositorio de pensionistas.
"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities.pensioner import Pensioner


class PensionerRepository(ABC):
    """Contrato que debe implementar cualquier repositorio de pensionistas."""

    @abstractmethod
    async def get_by_id(self, pensioner_id: int) -> Optional[Pensioner]:
        """Obtiene un pensionista por su ID."""
        ...

    @abstractmethod
    async def get_by_id_code(self, id_code: str) -> Optional[Pensioner]:
        """Obtiene un pensionista por su DNI o código interno."""
        ...

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Pensioner]:
        """Retorna la lista paginada de pensionistas."""
        ...

    @abstractmethod
    async def create(self, pensioner: Pensioner) -> Pensioner:
        """Persiste un nuevo pensionista y retorna la entidad con ID asignado."""
        ...

    @abstractmethod
    async def update(self, pensioner: Pensioner) -> Pensioner:
        """Actualiza los datos de un pensionista existente."""
        ...

    @abstractmethod
    async def deactivate(self, pensioner_id: int) -> bool:
        """Desactiva un pensionista (baja lógica). Retorna True si tuvo éxito."""
        ...

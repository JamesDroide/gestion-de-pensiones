"""
Interfaz del repositorio de pensionistas policías.
"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities.police import Police


class PoliceRepository(ABC):
    """Contrato que debe implementar cualquier repositorio de policías."""

    @abstractmethod
    async def get_by_id(self, police_id: int) -> Optional[Police]:
        """Obtiene un policía por su ID."""
        ...

    @abstractmethod
    async def get_by_badge_code(self, badge_code: str) -> Optional[Police]:
        """Obtiene un policía por su placa o código."""
        ...

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Police]:
        """Retorna la lista paginada de policías."""
        ...

    @abstractmethod
    async def create(self, police: Police) -> Police:
        """Persiste un nuevo policía y retorna la entidad con ID asignado."""
        ...

    @abstractmethod
    async def update(self, police: Police) -> Police:
        """Actualiza los datos de un policía existente."""
        ...

    @abstractmethod
    async def deactivate(self, police_id: int) -> bool:
        """Desactiva un policía (baja lógica). Retorna True si tuvo éxito."""
        ...

"""
Interfaz del repositorio de consumos (pensionistas y policías por separado).
"""
from abc import ABC, abstractmethod
from datetime import date
from typing import Optional
from ..entities.consumption import PensionerConsumption, PoliceConsumption


class PensionerConsumptionRepository(ABC):
    """Contrato para el repositorio de consumos de pensionistas."""

    @abstractmethod
    async def get_by_id(self, consumption_id: int) -> Optional[PensionerConsumption]:
        ...

    @abstractmethod
    async def get_by_pensioner_and_date(self, pensioner_id: int, date: date) -> Optional[PensionerConsumption]:
        """Retorna el consumo de un pensionista en una fecha específica."""
        ...

    @abstractmethod
    async def get_open_by_date(self, date: date) -> list[PensionerConsumption]:
        """Retorna todos los consumos de pensionistas abiertos (no cerrados) de una fecha."""
        ...

    @abstractmethod
    async def get_history(self, pensioner_id: int, from_date: date, to_date: date) -> list[PensionerConsumption]:
        """Retorna el historial de consumos de un pensionista en un rango de fechas."""
        ...

    @abstractmethod
    async def create(self, consumption: PensionerConsumption) -> PensionerConsumption:
        ...

    @abstractmethod
    async def update(self, consumption: PensionerConsumption) -> PensionerConsumption:
        """Actualiza un consumo (usado al cerrar el día con precios finales)."""
        ...


class PoliceConsumptionRepository(ABC):
    """Contrato para el repositorio de consumos de policías."""

    @abstractmethod
    async def get_by_id(self, consumption_id: int) -> Optional[PoliceConsumption]:
        ...

    @abstractmethod
    async def get_by_police_and_date(self, police_id: int, date: date) -> Optional[PoliceConsumption]:
        ...

    @abstractmethod
    async def get_history(self, police_id: int, from_date: date, to_date: date) -> list[PoliceConsumption]:
        ...

    @abstractmethod
    async def create(self, consumption: PoliceConsumption) -> PoliceConsumption:
        ...

    @abstractmethod
    async def update(self, consumption: PoliceConsumption) -> PoliceConsumption:
        ...

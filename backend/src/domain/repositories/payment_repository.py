"""
Interfaz del repositorio de pagos.
"""
from abc import ABC, abstractmethod
from datetime import date
from decimal import Decimal
from typing import Optional
from ..entities.payment import Payment


class PaymentRepository(ABC):

    @abstractmethod
    async def get_by_id(self, payment_id: int) -> Optional[Payment]:
        ...

    @abstractmethod
    async def get_by_pensioner(self, pensioner_id: int, from_date: Optional[date] = None, to_date: Optional[date] = None) -> list[Payment]:
        """Retorna pagos de un pensionista, opcionalmente filtrados por rango de fechas."""
        ...

    @abstractmethod
    async def get_by_police(self, police_id: int, from_date: Optional[date] = None, to_date: Optional[date] = None) -> list[Payment]:
        ...

    @abstractmethod
    async def create(self, payment: Payment) -> Payment:
        ...

    @abstractmethod
    async def get_total_debt_by_pensioner(self, pensioner_id: int) -> Decimal:
        """Calcula la deuda pendiente de un pensionista (consumos - pagos)."""
        ...

    @abstractmethod
    async def get_total_debt_by_police(self, police_id: int) -> Decimal:
        """Calcula la deuda pendiente de un policía."""
        ...

    @abstractmethod
    async def get_monthly_total(self, from_date: date, to_date: date, pensionista_type: str | None = None) -> Decimal:
        """Suma total de pagos en un rango. pensionista_type: 'civil' | 'police' | None (todos)."""
        ...

"""
Interfaz del repositorio de configuración de precios.
"""
from abc import ABC, abstractmethod
from ..entities.pricing_config import PricingConfig


class PricingConfigRepository(ABC):

    @abstractmethod
    async def get_current(self) -> PricingConfig:
        """Retorna la configuración de precios vigente."""
        ...

    @abstractmethod
    async def update(self, config: PricingConfig) -> PricingConfig:
        """Actualiza la configuración. NO afecta registros históricos."""
        ...

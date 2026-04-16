"""
Interfaces (contratos) de los repositorios del sistema.
"""
from .pensioner_repository import PensionerRepository
from .police_repository import PoliceRepository
from .consumption_repository import PensionerConsumptionRepository, PoliceConsumptionRepository
from .payment_repository import PaymentRepository
from .pricing_config_repository import PricingConfigRepository
from .user_repository import UserRepository

__all__ = [
    "PensionerRepository",
    "PoliceRepository",
    "PensionerConsumptionRepository",
    "PoliceConsumptionRepository",
    "PaymentRepository",
    "PricingConfigRepository",
    "UserRepository",
]

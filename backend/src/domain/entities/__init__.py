"""
Entidades de dominio del sistema de gestión de pensionistas.
"""
from .pensioner import Pensioner, PaymentMode
from .police import Police
from .consumption import PensionerConsumption, PoliceConsumption
from .payment import Payment, PaymentType
from .menu_item import MenuItem, MenuItemType
from .extra_consumption import ExtraConsumption
from .pricing_config import PricingConfig
from .user import User, UserRole

__all__ = [
    "Pensioner", "PaymentMode",
    "Police",
    "PensionerConsumption", "PoliceConsumption",
    "Payment", "PaymentType",
    "MenuItem", "MenuItemType",
    "ExtraConsumption",
    "PricingConfig",
    "User", "UserRole",
]

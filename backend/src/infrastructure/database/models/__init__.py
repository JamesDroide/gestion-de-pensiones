"""
Modelos ORM del sistema. Todos deben importarse aquí para que Alembic los detecte.
"""
from .base import Base
from .pensioner_model import PensionerModel
from .police_model import PoliceModel
from .consumption_model import PensionerConsumptionModel, PoliceConsumptionModel, ExtraConsumptionModel
from .payment_model import PaymentModel
from .menu_item_model import MenuItemModel
from .pricing_config_model import PricingConfigModel
from .user_model import UserModel

__all__ = [
    "Base",
    "PensionerModel",
    "PoliceModel",
    "PensionerConsumptionModel",
    "PoliceConsumptionModel",
    "ExtraConsumptionModel",
    "PaymentModel",
    "MenuItemModel",
    "PricingConfigModel",
    "UserModel",
]

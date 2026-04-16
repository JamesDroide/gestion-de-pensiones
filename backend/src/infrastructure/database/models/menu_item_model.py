"""
Modelo ORM para ítems del menú y carta.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, Enum, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from ....domain.entities.menu_item import MenuItemType


class MenuItemModel(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    item_type: Mapped[MenuItemType] = mapped_column(Enum(MenuItemType), nullable=False)
    is_price_editable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

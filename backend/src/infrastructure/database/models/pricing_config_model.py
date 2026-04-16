"""
Modelo ORM para la configuración de precios.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base


class PricingConfigModel(Base):
    __tablename__ = "pricing_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    menu_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("12.00"))
    menu_price_normal: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("10.00"))
    menu_price_2_meals: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("9.00"))
    menu_price_3_meals: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("8.00"))
    breakfast_ticket_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("4.00"))
    lunch_ticket_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("8.00"))
    dinner_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("6.00"))
    dinner_ticket_equivalence: Mapped[int] = mapped_column(Integer, default=2)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

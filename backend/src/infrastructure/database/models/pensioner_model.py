"""
Modelo ORM para pensionistas.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, Enum, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from ....domain.entities.pensioner import PaymentMode, NoPensionPriceMode


class PensionerModel(Base):
    __tablename__ = "pensioners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    id_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    payment_mode: Mapped[PaymentMode] = mapped_column(Enum(PaymentMode), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    no_pension_rules: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    no_pension_price_mode: Mapped[NoPensionPriceMode] = mapped_column(
        Enum(NoPensionPriceMode, name="nopensionpricemode", create_type=False, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=NoPensionPriceMode.MENU_PRICE,
    )
    custom_price_1_meal: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custom_price_2_meals: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custom_price_3_meals: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custom_breakfast_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custom_lunch_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    custom_dinner_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

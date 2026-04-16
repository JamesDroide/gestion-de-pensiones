"""
Modelo ORM para pagos recibidos.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from ....domain.entities.payment import PaymentType


class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), nullable=False)
    pensioner_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("pensioners.id"), nullable=True, index=True)
    police_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("police_officers.id"), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

"""
Modelos ORM para consumos diarios — pensionistas y policías en tablas separadas.
"""
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class PensionerConsumptionModel(Base):
    __tablename__ = "pensioner_consumptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pensioner_id: Mapped[int] = mapped_column(Integer, ForeignKey("pensioners.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    breakfast_count: Mapped[int] = mapped_column(Integer, default=0)
    lunch_count: Mapped[int] = mapped_column(Integer, default=0)
    dinner_count: Mapped[int] = mapped_column(Integer, default=0)
    extras_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    # Snapshots guardados al cerrar el día — NUNCA referenciar tabla de config
    unit_price_snapshot: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    total_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    extras: Mapped[list["ExtraConsumptionModel"]] = relationship(
        "ExtraConsumptionModel",
        foreign_keys="ExtraConsumptionModel.pensioner_consumption_id",
        back_populates="pensioner_consumption",
        lazy="selectin",
    )


class PoliceConsumptionModel(Base):
    __tablename__ = "police_consumptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    police_id: Mapped[int] = mapped_column(Integer, ForeignKey("police_officers.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    breakfast_count: Mapped[int] = mapped_column(Integer, default=0)
    lunch_count: Mapped[int] = mapped_column(Integer, default=0)
    dinner_count: Mapped[int] = mapped_column(Integer, default=0)
    # Snapshots de precios al momento del registro
    breakfast_ticket_value_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    lunch_ticket_value_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    dinner_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    # Totales
    extras_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    extras: Mapped[list["ExtraConsumptionModel"]] = relationship(
        "ExtraConsumptionModel",
        foreign_keys="ExtraConsumptionModel.police_consumption_id",
        back_populates="police_consumption",
        lazy="selectin",
    )


class ExtraConsumptionModel(Base):
    __tablename__ = "extra_consumptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dish_name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    # Solo uno de los dos puede estar asignado
    pensioner_consumption_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("pensioner_consumptions.id"), nullable=True, index=True)
    police_consumption_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("police_consumptions.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    pensioner_consumption: Mapped["PensionerConsumptionModel | None"] = relationship(
        "PensionerConsumptionModel", foreign_keys=[pensioner_consumption_id], back_populates="extras"
    )
    police_consumption: Mapped["PoliceConsumptionModel | None"] = relationship(
        "PoliceConsumptionModel", foreign_keys=[police_consumption_id], back_populates="extras"
    )

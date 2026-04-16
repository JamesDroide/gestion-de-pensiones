"""DTOs para el módulo de Cobros (pagos de pensionistas y policías)."""
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional
from pydantic import BaseModel
from src.domain.entities.payment import PaymentType
from src.application.dtos.consumption_dtos import ExtraItemDTO


class RegisterPaymentDTO(BaseModel):
    amount: Decimal
    payment_type: PaymentType = PaymentType.CASH
    description: Optional[str] = None
    discount_type: Optional[Literal['percent', 'fixed']] = None
    discount_value: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None   # precalculado en el frontend sobre la deuda


class PaymentRecordDTO(BaseModel):
    id: int
    amount: Decimal
    payment_type: str
    description: Optional[str]
    created_at: datetime
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    discount_amount: Decimal = Decimal("0.00")

    model_config = {"from_attributes": True}


class ConsumptionDayDTO(BaseModel):
    """Consumo de un día con total pre-calculado server-side."""
    id: int
    date: date
    breakfast_count: int
    lunch_count: int
    dinner_count: int
    has_breakfast: bool
    has_lunch: bool
    has_dinner: bool
    meal_count: int
    extras_total: Decimal
    extras: list[ExtraItemDTO] = []
    daily_total: Decimal
    is_closed: bool


class PensionerPaymentSummaryDTO(BaseModel):
    """Resumen completo de cobro de un pensionista para el modal de pago."""
    pensioner_id: int
    full_name: str
    id_code: str
    payment_mode: str
    month: str                         # 'YYYY-MM'
    consumptions: list[ConsumptionDayDTO]
    total_consumed: Decimal
    total_paid: Decimal
    debt_balance: Decimal              # positivo = debe, negativo = crédito
    payments: list[PaymentRecordDTO]


class PensionerWithDebtDTO(BaseModel):
    """Fila de la lista de pensionistas en la página de cobros."""
    pensioner_id: int
    full_name: str
    id_code: str
    payment_mode: str
    phone: Optional[str] = None
    debt_balance: Decimal
    last_payment_date: Optional[datetime]
    last_payment_amount: Optional[Decimal]
    status: str                        # 'paid' | 'debt'


# ─── DTOs de policías ──────────────────────────────────────────────────────────

class PoliceConsumptionDayDTO(BaseModel):
    """Consumo de un día de policía con desglose de menú y extras."""
    id: int
    date: date
    breakfast_count: int
    lunch_count: int
    dinner_count: int
    has_breakfast: bool
    has_lunch: bool
    has_dinner: bool
    breakfast_value: Decimal           # snapshot del día (precio unitario)
    lunch_value: Decimal               # snapshot del día (precio unitario)
    dinner_value: Decimal              # snapshot del día (precio unitario)
    extras_total: Decimal
    extras: list[ExtraItemDTO] = []
    menu_total: Decimal                # sum (precio × count) de las 3 comidas
    daily_total: Decimal               # menu_total + extras_total


class PolicePaymentSummaryDTO(BaseModel):
    """Resumen completo de cobro de un policía para el modal de pago."""
    police_id: int
    full_name: str
    badge_code: str
    rank: Optional[str]
    month: str
    consumptions: list[PoliceConsumptionDayDTO]
    total_menus: Decimal
    total_extras: Decimal
    total_consumed: Decimal
    total_paid: Decimal
    debt_balance: Decimal
    payments: list[PaymentRecordDTO]
    current_breakfast_ticket_value: Decimal   # precio vigente para calcular tickets
    current_lunch_ticket_value: Decimal


class PoliceWithDebtDTO(BaseModel):
    """Fila de la lista de policías en la página de cobros."""
    police_id: int
    full_name: str
    badge_code: str
    rank: Optional[str]
    phone: Optional[str] = None
    debt_balance: Decimal
    last_payment_date: Optional[datetime]
    last_payment_amount: Optional[Decimal]
    status: str                        # 'paid' | 'debt'


class RegisterPolicePaymentDTO(BaseModel):
    """Payload para registrar un pago de policía."""
    payment_type: PaymentType = PaymentType.CASH
    # Si payment_type == CASH o YAPE: amount es el monto directo
    amount: Optional[Decimal] = None
    # Si payment_type == TICKETS: se calculan contadores
    breakfast_tickets: int = 0
    lunch_tickets: int = 0
    description: Optional[str] = None
    discount_type: Optional[Literal['percent', 'fixed']] = None
    discount_value: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None   # precalculado en el frontend sobre la deuda

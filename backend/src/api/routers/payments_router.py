"""
Router de la API para el módulo de Cobros.
"""
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.session import get_db
from src.infrastructure.repositories.pensioner_repository_impl import SQLAlchemyPensionerRepository
from src.infrastructure.repositories.pensioner_consumption_repository_impl import SQLAlchemyPensionerConsumptionRepository
from src.infrastructure.repositories.police_repository_impl import SQLAlchemyPoliceRepository
from src.infrastructure.repositories.police_consumption_repository_impl import SQLAlchemyPoliceConsumptionRepository
from src.infrastructure.repositories.payment_repository_impl import SQLAlchemyPaymentRepository
from src.infrastructure.repositories.pricing_config_repository_impl import SQLAlchemyPricingConfigRepository
from src.application.use_cases.payments.list_pensioners_with_debt import ListPensionersWithDebtUseCase
from src.application.use_cases.payments.get_pensioner_payment_summary import GetPensionerPaymentSummaryUseCase
from src.application.use_cases.payments.register_pensioner_payment import RegisterPensionerPaymentUseCase
from src.application.use_cases.payments.list_police_with_debt import ListPoliceWithDebtUseCase
from src.application.use_cases.payments.get_police_payment_summary import GetPolicePaymentSummaryUseCase
from src.application.use_cases.payments.register_police_payment import RegisterPolicePaymentUseCase
from src.application.dtos.payment_dtos import (
    PensionerWithDebtDTO,
    PensionerPaymentSummaryDTO,
    RegisterPaymentDTO,
    PaymentRecordDTO,
    PoliceWithDebtDTO,
    PolicePaymentSummaryDTO,
    RegisterPolicePaymentDTO,
)
from src.api.dependencies.auth import get_current_user
from src.infrastructure.database.models.user_model import UserModel


def _current_month() -> str:
    today = date.today()
    return f"{today.year}-{str(today.month).zfill(2)}"


router = APIRouter(prefix="/payments", tags=["Cobros"])


@router.get("/pensioners", response_model=list[PensionerWithDebtDTO])
async def list_pensioners_with_debt(
    month: str = Query(default=None, description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Lista todos los pensionistas activos con su deuda calculada para el mes indicado."""
    target_month = month or _current_month()
    use_case = ListPensionersWithDebtUseCase(
        pensioner_repo=SQLAlchemyPensionerRepository(db),
        consumption_repo=SQLAlchemyPensionerConsumptionRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
        pricing_repo=SQLAlchemyPricingConfigRepository(db),
    )
    return await use_case.execute(target_month)


@router.get("/pensioners/{pensioner_id}/summary", response_model=PensionerPaymentSummaryDTO)
async def get_pensioner_payment_summary(
    pensioner_id: int,
    month: str = Query(default=None, description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna el detalle de consumos, pagos y deuda de un pensionista para el mes indicado."""
    target_month = month or _current_month()
    use_case = GetPensionerPaymentSummaryUseCase(
        pensioner_repo=SQLAlchemyPensionerRepository(db),
        consumption_repo=SQLAlchemyPensionerConsumptionRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
        pricing_repo=SQLAlchemyPricingConfigRepository(db),
    )
    return await use_case.execute(pensioner_id, target_month)


@router.post("/pensioners/{pensioner_id}/pay", response_model=PaymentRecordDTO, status_code=201)
async def register_pensioner_payment(
    pensioner_id: int,
    dto: RegisterPaymentDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Registra un pago de un pensionista. Si el monto no cubre la deuda total, la diferencia queda como deuda."""
    use_case = RegisterPensionerPaymentUseCase(
        pensioner_repo=SQLAlchemyPensionerRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
    )
    return await use_case.execute(pensioner_id, dto)


# ─── Endpoints de policías ────────────────────────────────────────────────────

@router.get("/police", response_model=list[PoliceWithDebtDTO])
async def list_police_with_debt(
    month: str = Query(default=None, description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Lista todos los policías activos con su deuda calculada para el mes indicado."""
    target_month = month or _current_month()
    use_case = ListPoliceWithDebtUseCase(
        police_repo=SQLAlchemyPoliceRepository(db),
        consumption_repo=SQLAlchemyPoliceConsumptionRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
    )
    return await use_case.execute(target_month)


@router.get("/police/{police_id}/summary", response_model=PolicePaymentSummaryDTO)
async def get_police_payment_summary(
    police_id: int,
    month: str = Query(default=None, description="Mes en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna el detalle de consumos, pagos y deuda de un policía para el mes indicado."""
    target_month = month or _current_month()
    use_case = GetPolicePaymentSummaryUseCase(
        police_repo=SQLAlchemyPoliceRepository(db),
        consumption_repo=SQLAlchemyPoliceConsumptionRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
        pricing_repo=SQLAlchemyPricingConfigRepository(db),
    )
    return await use_case.execute(police_id, target_month)


@router.post("/police/{police_id}/pay", response_model=PaymentRecordDTO, status_code=201)
async def register_police_payment(
    police_id: int,
    dto: RegisterPolicePaymentDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Registra un pago de un policía (efectivo, Yape o tickets físicos)."""
    use_case = RegisterPolicePaymentUseCase(
        police_repo=SQLAlchemyPoliceRepository(db),
        payment_repo=SQLAlchemyPaymentRepository(db),
        pricing_repo=SQLAlchemyPricingConfigRepository(db),
    )
    return await use_case.execute(police_id, dto)


@router.get("/monthly-total")
async def get_monthly_total(
    month: str = Query(default=None, description="Mes en formato YYYY-MM"),
    type: str = Query(default=None, description="Filtro: 'civil' | 'police' | None para ambos"),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Suma total de pagos registrados en el mes indicado, opcionalmente filtrado por tipo."""
    from calendar import monthrange
    target = month or _current_month()
    year, m = int(target.split("-")[0]), int(target.split("-")[1])
    from_date = date(year, m, 1)
    to_date = date(year, m, monthrange(year, m)[1])
    payment_repo = SQLAlchemyPaymentRepository(db)
    total = await payment_repo.get_monthly_total(from_date, to_date, pensionista_type=type)
    return {"month": target, "total": str(total)}

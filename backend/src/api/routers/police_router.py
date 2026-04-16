"""
Router de la API para gestión de pensionistas policías.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.session import get_db
from src.infrastructure.repositories.police_repository_impl import SQLAlchemyPoliceRepository
from src.application.use_cases.police.create_police import CreatePoliceUseCase
from src.application.use_cases.police.list_police import ListPoliceUseCase
from src.application.use_cases.police.get_police import GetPoliceUseCase
from src.application.use_cases.police.update_police import UpdatePoliceUseCase
from src.application.dtos.police_dtos import PoliceCreateDTO, PoliceUpdateDTO, PoliceResponseDTO
from src.api.dependencies.auth import get_current_user, require_admin
from src.infrastructure.database.models.user_model import UserModel

router = APIRouter(prefix="/police", tags=["Policías"])


@router.get("/", response_model=list[PoliceResponseDTO])
async def list_police(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna la lista paginada de pensionistas policías."""
    repo = SQLAlchemyPoliceRepository(db)
    return await ListPoliceUseCase(repo).execute(skip=skip, limit=limit, active_only=active_only)


@router.post("/", response_model=PoliceResponseDTO, status_code=201)
async def create_police(
    dto: PoliceCreateDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Registra un nuevo pensionista policía en el sistema."""
    repo = SQLAlchemyPoliceRepository(db)
    return await CreatePoliceUseCase(repo).execute(dto)


@router.get("/{police_id}", response_model=PoliceResponseDTO)
async def get_police(
    police_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna los datos de un pensionista policía por su ID."""
    repo = SQLAlchemyPoliceRepository(db)
    return await GetPoliceUseCase(repo).execute(police_id)


@router.patch("/{police_id}", response_model=PoliceResponseDTO)
async def update_police(
    police_id: int,
    dto: PoliceUpdateDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Actualiza parcialmente los datos de un pensionista policía."""
    repo = SQLAlchemyPoliceRepository(db)
    return await UpdatePoliceUseCase(repo).execute(police_id, dto)


@router.delete("/{police_id}", status_code=204)
async def deactivate_police(
    police_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(require_admin),
):
    """
    Desactiva un pensionista policía (baja lógica).
    Solo administradores pueden realizar esta acción.
    """
    repo = SQLAlchemyPoliceRepository(db)
    success = await repo.deactivate(police_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policía no encontrado")

"""
Router de la API para gestión de pensionistas.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.session import get_db
from src.infrastructure.repositories.pensioner_repository_impl import SQLAlchemyPensionerRepository
from src.application.use_cases.pensioners.create_pensioner import CreatePensionerUseCase
from src.application.use_cases.pensioners.list_pensioners import ListPensionersUseCase
from src.application.use_cases.pensioners.get_pensioner import GetPensionerUseCase
from src.application.use_cases.pensioners.update_pensioner import UpdatePensionerUseCase
from src.application.dtos.pensioner_dtos import PensionerCreateDTO, PensionerUpdateDTO, PensionerResponseDTO
from src.api.dependencies.auth import get_current_user, require_admin
from src.infrastructure.database.models.user_model import UserModel

router = APIRouter(prefix="/pensioners", tags=["Pensionistas"])


@router.get("/", response_model=list[PensionerResponseDTO])
async def list_pensioners(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna la lista paginada de pensionistas."""
    repo = SQLAlchemyPensionerRepository(db)
    return await ListPensionersUseCase(repo).execute(skip=skip, limit=limit, active_only=active_only)


@router.post("/", response_model=PensionerResponseDTO, status_code=201)
async def create_pensioner(
    dto: PensionerCreateDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Registra un nuevo pensionista en el sistema."""
    repo = SQLAlchemyPensionerRepository(db)
    return await CreatePensionerUseCase(repo).execute(dto)


@router.get("/{pensioner_id}", response_model=PensionerResponseDTO)
async def get_pensioner(
    pensioner_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Retorna los datos de un pensionista por su ID."""
    repo = SQLAlchemyPensionerRepository(db)
    return await GetPensionerUseCase(repo).execute(pensioner_id)


@router.patch("/{pensioner_id}", response_model=PensionerResponseDTO)
async def update_pensioner(
    pensioner_id: int,
    dto: PensionerUpdateDTO,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    """Actualiza parcialmente los datos de un pensionista."""
    repo = SQLAlchemyPensionerRepository(db)
    return await UpdatePensionerUseCase(repo).execute(pensioner_id, dto)


@router.delete("/{pensioner_id}", status_code=204)
async def deactivate_pensioner(
    pensioner_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(require_admin),
):
    """
    Desactiva un pensionista (baja lógica).
    Solo administradores pueden realizar esta acción.
    """
    repo = SQLAlchemyPensionerRepository(db)
    success = await repo.deactivate(pensioner_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pensionista no encontrado")

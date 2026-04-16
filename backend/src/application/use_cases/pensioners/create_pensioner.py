"""
Caso de uso: Registrar nuevo pensionista.
"""
from fastapi import HTTPException, status
from src.domain.entities.pensioner import Pensioner
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.application.dtos.pensioner_dtos import PensionerCreateDTO


class CreatePensionerUseCase:
    def __init__(self, repo: PensionerRepository):
        self._repo = repo

    async def execute(self, dto: PensionerCreateDTO) -> Pensioner:
        """
        Crea un nuevo pensionista.
        Valida que el código DNI no esté registrado previamente.
        """
        existing = await self._repo.get_by_id_code(dto.id_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un pensionista con el código '{dto.id_code}'",
            )
        pensioner = Pensioner(
            id=0,  # la BD asignará el ID real
            full_name=dto.full_name,
            id_code=dto.id_code,
            payment_mode=dto.payment_mode,
            no_pension_rules=dto.no_pension_rules,
            phone=dto.phone,
            notes=dto.notes,
        )
        return await self._repo.create(pensioner)

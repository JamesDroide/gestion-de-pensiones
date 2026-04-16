"""
Implementación SQLAlchemy del repositorio de policías.
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.police import Police
from src.domain.repositories.police_repository import PoliceRepository
from src.infrastructure.database.models.police_model import PoliceModel


class SQLAlchemyPoliceRepository(PoliceRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PoliceModel) -> Police:
        """Convierte un modelo ORM a entidad de dominio."""
        return Police(
            id=model.id,
            full_name=model.full_name,
            badge_code=model.badge_code,
            rank=model.rank,
            phone=model.phone,
            notes=model.notes,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, police_id: int) -> Optional[Police]:
        """Obtiene un policía por su ID primario."""
        result = await self._session.get(PoliceModel, police_id)
        return self._to_entity(result) if result else None

    async def get_by_badge_code(self, badge_code: str) -> Optional[Police]:
        """Obtiene un policía por su número de placa o código."""
        stmt = select(PoliceModel).where(PoliceModel.badge_code == badge_code)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Police]:
        """Retorna la lista paginada de policías, ordenada por nombre."""
        stmt = select(PoliceModel)
        if active_only:
            stmt = stmt.where(PoliceModel.is_active == True)
        stmt = stmt.offset(skip).limit(limit).order_by(PoliceModel.full_name)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, police: Police) -> Police:
        """Persiste un nuevo policía y retorna la entidad con ID asignado por la BD."""
        model = PoliceModel(
            full_name=police.full_name,
            badge_code=police.badge_code,
            rank=police.rank,
            phone=police.phone,
            notes=police.notes,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, police: Police) -> Police:
        """Actualiza los datos modificables de un policía existente."""
        model = await self._session.get(PoliceModel, police.id)
        if not model:
            raise ValueError(f"Policía con ID {police.id} no encontrado")
        model.full_name = police.full_name
        model.rank = police.rank
        model.phone = police.phone
        model.notes = police.notes
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def deactivate(self, police_id: int) -> bool:
        """Realiza baja lógica del policía. Retorna False si no existe."""
        model = await self._session.get(PoliceModel, police_id)
        if not model:
            return False
        model.is_active = False
        await self._session.flush()
        return True

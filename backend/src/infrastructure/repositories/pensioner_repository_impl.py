"""
Implementación SQLAlchemy del repositorio de pensionistas.
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities.pensioner import Pensioner, PaymentMode, NoPensionPriceMode
from src.domain.repositories.pensioner_repository import PensionerRepository
from src.infrastructure.database.models.pensioner_model import PensionerModel


class SQLAlchemyPensionerRepository(PensionerRepository):

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PensionerModel) -> Pensioner:
        """Convierte un modelo ORM a entidad de dominio."""
        return Pensioner(
            id=model.id,
            full_name=model.full_name,
            id_code=model.id_code,
            payment_mode=model.payment_mode,
            no_pension_rules=model.no_pension_rules,
            no_pension_price_mode=model.no_pension_price_mode,
            phone=model.phone,
            notes=model.notes,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
            custom_price_1_meal=model.custom_price_1_meal,
            custom_price_2_meals=model.custom_price_2_meals,
            custom_price_3_meals=model.custom_price_3_meals,
            custom_breakfast_price=model.custom_breakfast_price,
            custom_lunch_price=model.custom_lunch_price,
            custom_dinner_price=model.custom_dinner_price,
        )

    async def get_by_id(self, pensioner_id: int) -> Optional[Pensioner]:
        """Obtiene un pensionista por su ID primario."""
        result = await self._session.get(PensionerModel, pensioner_id)
        return self._to_entity(result) if result else None

    async def get_by_id_code(self, id_code: str) -> Optional[Pensioner]:
        """Obtiene un pensionista por su DNI o código interno."""
        stmt = select(PensionerModel).where(PensionerModel.id_code == id_code)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> list[Pensioner]:
        """Retorna la lista paginada de pensionistas, ordenada por nombre."""
        stmt = select(PensionerModel)
        if active_only:
            stmt = stmt.where(PensionerModel.is_active == True)
        stmt = stmt.offset(skip).limit(limit).order_by(PensionerModel.full_name)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, pensioner: Pensioner) -> Pensioner:
        """Persiste un nuevo pensionista y retorna la entidad con ID asignado por la BD."""
        model = PensionerModel(
            full_name=pensioner.full_name,
            id_code=pensioner.id_code,
            payment_mode=pensioner.payment_mode,
            no_pension_rules=pensioner.no_pension_rules,
            no_pension_price_mode=pensioner.no_pension_price_mode,
            phone=pensioner.phone,
            notes=pensioner.notes,
            custom_price_1_meal=pensioner.custom_price_1_meal,
            custom_price_2_meals=pensioner.custom_price_2_meals,
            custom_price_3_meals=pensioner.custom_price_3_meals,
            custom_breakfast_price=pensioner.custom_breakfast_price,
            custom_lunch_price=pensioner.custom_lunch_price,
            custom_dinner_price=pensioner.custom_dinner_price,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, pensioner: Pensioner) -> Pensioner:
        """Actualiza los datos modificables de un pensionista existente."""
        model = await self._session.get(PensionerModel, pensioner.id)
        if not model:
            raise ValueError(f"Pensionista con ID {pensioner.id} no encontrado")
        model.full_name = pensioner.full_name
        model.phone = pensioner.phone
        model.notes = pensioner.notes
        model.payment_mode = pensioner.payment_mode
        model.no_pension_rules = pensioner.no_pension_rules
        model.no_pension_price_mode = pensioner.no_pension_price_mode
        model.custom_price_1_meal = pensioner.custom_price_1_meal
        model.custom_price_2_meals = pensioner.custom_price_2_meals
        model.custom_price_3_meals = pensioner.custom_price_3_meals
        model.custom_breakfast_price = pensioner.custom_breakfast_price
        model.custom_lunch_price = pensioner.custom_lunch_price
        model.custom_dinner_price = pensioner.custom_dinner_price
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def deactivate(self, pensioner_id: int) -> bool:
        """Realiza baja lógica del pensionista. Retorna False si no existe."""
        model = await self._session.get(PensionerModel, pensioner_id)
        if not model:
            return False
        model.is_active = False
        await self._session.flush()
        return True

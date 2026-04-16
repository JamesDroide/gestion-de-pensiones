"""
Datos iniciales: crea el usuario administrador y la configuración de precios por defecto.
Ejecutar manualmente: python -m src.infrastructure.database.seed

Las credenciales del admin se leen desde variables de entorno:
  ADMIN_EMAIL    — email del administrador
  ADMIN_PASSWORD — contraseña inicial (cámbiala tras el primer login)
"""
import asyncio
import os
from sqlalchemy import select
from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.user_model import UserModel
from src.infrastructure.database.models.pricing_config_model import PricingConfigModel
from src.infrastructure.auth.hashing import hash_password
from src.domain.entities.user import UserRole


async def seed():
    """
    Crea el administrador por defecto y la configuración inicial de precios
    si no existen. Es seguro ejecutar múltiples veces (idempotente).
    """
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("ERROR: Define ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env antes de ejecutar el seed.")
        return

    async with AsyncSessionLocal() as session:
        # --- Usuario administrador ---
        result = await session.execute(
            select(UserModel).where(UserModel.email == admin_email)
        )
        if not result.scalar_one_or_none():
            admin = UserModel(
                name="Administrador",
                email=admin_email,
                password_hash=hash_password(admin_password),
                role=UserRole.ADMINISTRATOR,
            )
            session.add(admin)
            print(f"Administrador creado: {admin_email}")
            print("IMPORTANTE: Cambia la contraseña después del primer login.")
        else:
            print("El administrador ya existe, no se crea duplicado.")

        # --- Configuración de precios por defecto ---
        result = await session.execute(select(PricingConfigModel).limit(1))
        if not result.scalar_one_or_none():
            pricing = PricingConfigModel()
            session.add(pricing)
            print("Configuración de precios por defecto creada.")
        else:
            print("La configuración de precios ya existe.")

        await session.commit()
        print("Seed completado correctamente.")


if __name__ == "__main__":
    asyncio.run(seed())

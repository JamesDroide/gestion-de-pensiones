"""
Punto de entrada principal de la aplicación FastAPI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.api.routers.auth_router import router as auth_router
from src.api.routers.pensioners_router import router as pensioners_router
from src.api.routers.police_router import router as police_router
from src.api.routers.consumption_router import router as consumption_router
from src.api.routers.settings_router import router as settings_router
from src.api.routers.payments_router import router as payments_router

_is_dev = settings.ENVIRONMENT != "production"

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    # Deshabilitar documentación interactiva en producción
    docs_url="/docs" if _is_dev else None,
    redoc_url="/redoc" if _is_dev else None,
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los routers del MVP
app.include_router(auth_router)
app.include_router(pensioners_router)
app.include_router(police_router)
app.include_router(consumption_router)
app.include_router(settings_router)
app.include_router(payments_router)


@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud del servidor."""
    return {"status": "ok", "app": settings.APP_NAME}

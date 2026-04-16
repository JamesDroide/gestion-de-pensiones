FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL y compilar paquetes
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copiar el archivo de configuración de Alembic (Vital para las migraciones en Railway)
COPY alembic.ini .

# Copiar todo el código fuente (Esto incluye tus migraciones que están dentro de src/)
COPY src/ ./src/

# Exponer el puerto por defecto (Railway lo sobrescribe con $PORT dinámicamente)
EXPOSE 8000

# Comando de arranque por defecto
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
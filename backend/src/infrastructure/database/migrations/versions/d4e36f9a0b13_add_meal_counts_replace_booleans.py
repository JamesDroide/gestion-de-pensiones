"""add meal counts, replace boolean columns with integer counts

Revision ID: d4e36f9a0b13
Revises: c3d25e8f9a02
Create Date: 2026-04-15

Cambios:
- pensioner_consumptions: agrega breakfast_count/lunch_count/dinner_count (int),
  migra datos desde has_breakfast/has_lunch/has_dinner (bool), elimina columnas bool
- police_consumptions: agrega breakfast_count/lunch_count/dinner_count (int),
  migra datos desde has_breakfast/has_lunch/has_dinner, elimina columnas bool y legacy
"""
from typing import Union, Sequence
import sqlalchemy as sa
from alembic import op

revision: str = 'd4e36f9a0b13'
down_revision: Union[str, Sequence[str], None] = 'c3d25e8f9a02'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── pensioner_consumptions ─────────────────────────────────────────────────
    op.add_column('pensioner_consumptions',
        sa.Column('breakfast_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pensioner_consumptions',
        sa.Column('lunch_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pensioner_consumptions',
        sa.Column('dinner_count', sa.Integer(), nullable=False, server_default='0'))

    # Migrar datos: bool True → 1, False → 0
    op.execute("""
        UPDATE pensioner_consumptions SET
            breakfast_count = CASE WHEN has_breakfast THEN 1 ELSE 0 END,
            lunch_count     = CASE WHEN has_lunch     THEN 1 ELSE 0 END,
            dinner_count    = CASE WHEN has_dinner    THEN 1 ELSE 0 END
    """)

    op.drop_column('pensioner_consumptions', 'has_breakfast')
    op.drop_column('pensioner_consumptions', 'has_lunch')
    op.drop_column('pensioner_consumptions', 'has_dinner')

    # ── police_consumptions ────────────────────────────────────────────────────
    op.add_column('police_consumptions',
        sa.Column('breakfast_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('lunch_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('dinner_count', sa.Integer(), nullable=False, server_default='0'))

    # Migrar datos desde booleans
    op.execute("""
        UPDATE police_consumptions SET
            breakfast_count = CASE WHEN has_breakfast THEN 1 ELSE 0 END,
            lunch_count     = CASE WHEN has_lunch     THEN 1 ELSE 0 END,
            dinner_count    = CASE WHEN has_dinner    THEN 1 ELSE 0 END
    """)

    op.drop_column('police_consumptions', 'has_breakfast')
    op.drop_column('police_consumptions', 'has_lunch')
    op.drop_column('police_consumptions', 'has_dinner')
    # Eliminar columnas legacy que no se usan en la nueva lógica
    op.drop_column('police_consumptions', 'breakfast_tickets_used')
    op.drop_column('police_consumptions', 'lunch_tickets_used')
    op.drop_column('police_consumptions', 'total_ticket_value')
    op.drop_column('police_consumptions', 'cash_paid')
    op.drop_column('police_consumptions', 'cash_difference')


def downgrade() -> None:
    # ── police_consumptions ────────────────────────────────────────────────────
    op.add_column('police_consumptions',
        sa.Column('has_breakfast', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('police_consumptions',
        sa.Column('has_lunch', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('police_consumptions',
        sa.Column('has_dinner', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('police_consumptions',
        sa.Column('breakfast_tickets_used', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('lunch_tickets_used', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('total_ticket_value', sa.Numeric(10, 2), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('cash_paid', sa.Numeric(10, 2), nullable=False, server_default='0'))
    op.add_column('police_consumptions',
        sa.Column('cash_difference', sa.Numeric(10, 2), nullable=False, server_default='0'))

    op.execute("""
        UPDATE police_consumptions SET
            has_breakfast = breakfast_count > 0,
            has_lunch     = lunch_count > 0,
            has_dinner    = dinner_count > 0
    """)

    op.drop_column('police_consumptions', 'breakfast_count')
    op.drop_column('police_consumptions', 'lunch_count')
    op.drop_column('police_consumptions', 'dinner_count')

    # ── pensioner_consumptions ─────────────────────────────────────────────────
    op.add_column('pensioner_consumptions',
        sa.Column('has_breakfast', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('pensioner_consumptions',
        sa.Column('has_lunch', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('pensioner_consumptions',
        sa.Column('has_dinner', sa.Boolean(), nullable=False, server_default=sa.false()))

    op.execute("""
        UPDATE pensioner_consumptions SET
            has_breakfast = breakfast_count > 0,
            has_lunch     = lunch_count > 0,
            has_dinner    = dinner_count > 0
    """)

    op.drop_column('pensioner_consumptions', 'breakfast_count')
    op.drop_column('pensioner_consumptions', 'lunch_count')
    op.drop_column('pensioner_consumptions', 'dinner_count')

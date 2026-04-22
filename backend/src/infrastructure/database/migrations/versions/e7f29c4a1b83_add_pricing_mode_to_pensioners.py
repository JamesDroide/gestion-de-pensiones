"""add_pricing_mode_to_pensioners

Revision ID: e7f29c4a1b83
Revises: 3b3024b538f4
Create Date: 2026-04-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e7f29c4a1b83'
down_revision: Union[str, Sequence[str], None] = 'f6a58b1c2d35'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE nopensionpricemode AS ENUM ('menu_price', 'custom_tiered', 'custom_by_type')")
    op.execute("ALTER TABLE pensioners ADD COLUMN no_pension_price_mode nopensionpricemode NOT NULL DEFAULT 'menu_price'")
    op.add_column('pensioners', sa.Column('custom_price_1_meal', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('pensioners', sa.Column('custom_price_2_meals', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('pensioners', sa.Column('custom_price_3_meals', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('pensioners', sa.Column('custom_breakfast_price', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('pensioners', sa.Column('custom_lunch_price', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('pensioners', sa.Column('custom_dinner_price', sa.Numeric(precision=10, scale=2), nullable=True))


def downgrade() -> None:
    op.drop_column('pensioners', 'custom_dinner_price')
    op.drop_column('pensioners', 'custom_lunch_price')
    op.drop_column('pensioners', 'custom_breakfast_price')
    op.drop_column('pensioners', 'custom_price_3_meals')
    op.drop_column('pensioners', 'custom_price_2_meals')
    op.drop_column('pensioners', 'custom_price_1_meal')
    op.drop_column('pensioners', 'no_pension_price_mode')
    op.execute("DROP TYPE nopensionpricemode")

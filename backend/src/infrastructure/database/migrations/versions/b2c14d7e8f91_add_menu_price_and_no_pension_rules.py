"""add_menu_price_and_no_pension_rules

Revision ID: b2c14d7e8f91
Revises: a1fa05e431bb
Create Date: 2026-04-15 10:00:00.000000

"""
from typing import Sequence, Union
from decimal import Decimal

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c14d7e8f91'
down_revision: Union[str, Sequence[str], None] = 'a1fa05e431bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agrega precio base del menú (para pensionistas sin reglas de pensión)
    op.add_column(
        'pricing_config',
        sa.Column('menu_price', sa.Numeric(10, 2), nullable=False, server_default='12.00'),
    )

    # Agrega flag de "no aplica reglas de pensiones" en civiles
    op.add_column(
        'civilians',
        sa.Column('no_pension_rules', sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column('civilians', 'no_pension_rules')
    op.drop_column('pricing_config', 'menu_price')

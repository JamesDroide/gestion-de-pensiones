"""add_discount_to_payments

Revision ID: f6a58b1c2d35
Revises: 3b3024b538f4
Create Date: 2026-04-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f6a58b1c2d35'
down_revision: Union[str, None] = '3b3024b538f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('payments', sa.Column('discount_type', sa.String(10), nullable=True))
    op.add_column('payments', sa.Column('discount_value', sa.Numeric(10, 2), nullable=True, server_default='0'))
    op.add_column('payments', sa.Column('discount_amount', sa.Numeric(10, 2), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('payments', 'discount_amount')
    op.drop_column('payments', 'discount_value')
    op.drop_column('payments', 'discount_type')

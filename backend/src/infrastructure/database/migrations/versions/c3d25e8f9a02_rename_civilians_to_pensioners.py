"""rename_civilians_to_pensioners

Revision ID: c3d25e8f9a02
Revises: b2c14d7e8f91
Create Date: 2026-04-15 19:25:00.000000

Renombra todas las tablas y columnas que usaban el término 'civilian'
al término canónico 'pensioner' para tener consistencia con el dominio.

Cambios:
- Tabla 'civilians'            → 'pensioners'
- Tabla 'civilian_consumptions'→ 'pensioner_consumptions'
- Columna 'civilian_id'        → 'pensioner_id' en payments
- Columna 'civilian_id'        → 'pensioner_id' en pensioner_consumptions
- Columna 'civilian_consumption_id' → 'pensioner_consumption_id' en extra_consumptions
- Índices y FK constraints actualizados en consecuencia
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d25e8f9a02'
down_revision: Union[str, Sequence[str], None] = 'b2c14d7e8f91'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ─── 1. Eliminar FK e índices dependientes antes de renombrar ─────────────

    # FK en extra_consumptions → civilian_consumptions
    op.drop_constraint(
        'extra_consumptions_civilian_consumption_id_fkey',
        'extra_consumptions',
        type_='foreignkey',
    )
    op.drop_index(
        'ix_extra_consumptions_civilian_consumption_id',
        table_name='extra_consumptions',
    )

    # FK en civilian_consumptions → civilians
    op.drop_constraint(
        'civilian_consumptions_civilian_id_fkey',
        'civilian_consumptions',
        type_='foreignkey',
    )
    op.drop_index('ix_civilian_consumptions_civilian_id', table_name='civilian_consumptions')
    op.drop_index('ix_civilian_consumptions_date',        table_name='civilian_consumptions')
    op.drop_index('ix_civilian_consumptions_id',          table_name='civilian_consumptions')

    # FK en payments → civilians
    op.drop_constraint(
        'payments_civilian_id_fkey',
        'payments',
        type_='foreignkey',
    )
    op.drop_index('ix_payments_civilian_id', table_name='payments')

    # Índices en civilians
    op.drop_index('ix_civilians_id',      table_name='civilians')
    op.drop_index('ix_civilians_id_code', table_name='civilians')

    # ─── 2. Renombrar tablas ──────────────────────────────────────────────────

    op.rename_table('civilians',             'pensioners')
    op.rename_table('civilian_consumptions', 'pensioner_consumptions')

    # ─── 3. Renombrar columnas ────────────────────────────────────────────────

    # pensioner_consumptions: civilian_id → pensioner_id
    op.alter_column(
        'pensioner_consumptions',
        'civilian_id',
        new_column_name='pensioner_id',
    )

    # extra_consumptions: civilian_consumption_id → pensioner_consumption_id
    op.alter_column(
        'extra_consumptions',
        'civilian_consumption_id',
        new_column_name='pensioner_consumption_id',
    )

    # payments: civilian_id → pensioner_id
    op.alter_column(
        'payments',
        'civilian_id',
        new_column_name='pensioner_id',
    )

    # ─── 4. Recrear índices con los nuevos nombres ────────────────────────────

    op.create_index('ix_pensioners_id',      'pensioners', ['id'])
    op.create_index('ix_pensioners_id_code', 'pensioners', ['id_code'], unique=True)

    op.create_index('ix_pensioner_consumptions_id',          'pensioner_consumptions', ['id'])
    op.create_index('ix_pensioner_consumptions_date',         'pensioner_consumptions', ['date'])
    op.create_index('ix_pensioner_consumptions_pensioner_id', 'pensioner_consumptions', ['pensioner_id'])

    op.create_index('ix_extra_consumptions_pensioner_consumption_id',
                    'extra_consumptions', ['pensioner_consumption_id'])

    op.create_index('ix_payments_pensioner_id', 'payments', ['pensioner_id'])

    # ─── 5. Recrear FK constraints con los nuevos nombres ────────────────────

    op.create_foreign_key(
        'pensioner_consumptions_pensioner_id_fkey',
        'pensioner_consumptions', 'pensioners',
        ['pensioner_id'], ['id'],
    )

    op.create_foreign_key(
        'extra_consumptions_pensioner_consumption_id_fkey',
        'extra_consumptions', 'pensioner_consumptions',
        ['pensioner_consumption_id'], ['id'],
    )

    op.create_foreign_key(
        'payments_pensioner_id_fkey',
        'payments', 'pensioners',
        ['pensioner_id'], ['id'],
    )


def downgrade() -> None:
    # ─── Eliminar nuevos FK e índices ────────────────────────────────────────

    op.drop_constraint('payments_pensioner_id_fkey',                          'payments',               type_='foreignkey')
    op.drop_constraint('extra_consumptions_pensioner_consumption_id_fkey',    'extra_consumptions',      type_='foreignkey')
    op.drop_constraint('pensioner_consumptions_pensioner_id_fkey',            'pensioner_consumptions',  type_='foreignkey')

    op.drop_index('ix_payments_pensioner_id',                         table_name='payments')
    op.drop_index('ix_extra_consumptions_pensioner_consumption_id',   table_name='extra_consumptions')
    op.drop_index('ix_pensioner_consumptions_pensioner_id',           table_name='pensioner_consumptions')
    op.drop_index('ix_pensioner_consumptions_date',                   table_name='pensioner_consumptions')
    op.drop_index('ix_pensioner_consumptions_id',                     table_name='pensioner_consumptions')
    op.drop_index('ix_pensioners_id_code',                            table_name='pensioners')
    op.drop_index('ix_pensioners_id',                                 table_name='pensioners')

    # ─── Revertir columnas ────────────────────────────────────────────────────

    op.alter_column('payments',               'pensioner_id',              new_column_name='civilian_id')
    op.alter_column('extra_consumptions',     'pensioner_consumption_id',  new_column_name='civilian_consumption_id')
    op.alter_column('pensioner_consumptions', 'pensioner_id',              new_column_name='civilian_id')

    # ─── Revertir tablas ──────────────────────────────────────────────────────

    op.rename_table('pensioner_consumptions', 'civilian_consumptions')
    op.rename_table('pensioners',             'civilians')

    # ─── Recrear índices y FK originales ─────────────────────────────────────

    op.create_index('ix_civilians_id',      'civilians', ['id'])
    op.create_index('ix_civilians_id_code', 'civilians', ['id_code'], unique=True)

    op.create_index('ix_civilian_consumptions_id',          'civilian_consumptions', ['id'])
    op.create_index('ix_civilian_consumptions_date',         'civilian_consumptions', ['date'])
    op.create_index('ix_civilian_consumptions_civilian_id',  'civilian_consumptions', ['civilian_id'])

    op.create_index('ix_extra_consumptions_civilian_consumption_id',
                    'extra_consumptions', ['civilian_consumption_id'])

    op.create_index('ix_payments_civilian_id', 'payments', ['civilian_id'])

    op.create_foreign_key(
        'civilian_consumptions_civilian_id_fkey',
        'civilian_consumptions', 'civilians',
        ['civilian_id'], ['id'],
    )
    op.create_foreign_key(
        'extra_consumptions_civilian_consumption_id_fkey',
        'extra_consumptions', 'civilian_consumptions',
        ['civilian_consumption_id'], ['id'],
    )
    op.create_foreign_key(
        'payments_civilian_id_fkey',
        'payments', 'civilians',
        ['civilian_id'], ['id'],
    )

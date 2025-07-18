"""Add Cloudflare URL to image instance upon creation

Revision ID: ab4380c3ebb3
Revises: 83d93fe78078
Create Date: 2025-07-01 18:49:43.932899

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ab4380c3ebb3'
down_revision = '83d93fe78078'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('image', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cloudflare_url', sa.String(length=1000), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('image', schema=None) as batch_op:
        batch_op.drop_column('cloudflare_url')

    # ### end Alembic commands ###

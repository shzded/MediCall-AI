"""create calls table

Revision ID: 001
Revises:
Create Date: 2026-02-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "calls",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("urgency", sa.String(10), nullable=False),
        sa.Column("time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration", sa.String(20), nullable=False, server_default="00:00:00"),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(10), nullable=False, server_default="unread"),
        sa.Column("symptoms", ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("callback_requested", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("callback_completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("callback_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("twilio_call_sid", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_calls_status", "calls", ["status"])
    op.create_index("ix_calls_urgency", "calls", ["urgency"])
    op.create_index("ix_calls_time_desc", "calls", [sa.text("time DESC")])
    op.create_index("ix_calls_created_at_desc", "calls", [sa.text("created_at DESC")])


def downgrade() -> None:
    op.drop_table("calls")

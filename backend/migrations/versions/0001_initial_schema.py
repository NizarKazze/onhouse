"""Initial schema: artists, events, line-ups and admin auth.

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-29
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

PLATFORMS = (
    "instagram", "soundcloud", "spotify", "resident_advisor",
    "beatport", "youtube", "tiktok", "website",
)


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    ]


def upgrade() -> None:
    op.create_table(
        "artists",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("genre", sa.String(80), nullable=False),
        sa.Column("description_en", sa.Text()),
        sa.Column("description_es", sa.Text()),
        sa.Column("image_url", sa.String(500)),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
    )
    op.create_index("ix_artists_published_order", "artists", ["is_published", "sort_order"])

    op.create_table(
        "artist_links",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "artist_id", sa.Integer(),
            sa.ForeignKey("artists.id", name="fk_artist_links_artist", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("platform", sa.String(20), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.UniqueConstraint("artist_id", "platform", name="uq_artist_links_platform"),
        sa.CheckConstraint(
            "platform IN (" + ", ".join(f"'{p}'" for p in PLATFORMS) + ")",
            name="ck_artist_links_platform",
        ),
    )

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("number", sa.SmallInteger(), nullable=False),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("city", sa.String(80), nullable=False),
        sa.Column("venue", sa.String(120)),
        sa.Column("event_date", sa.Date()),
        sa.Column("doors_open", sa.Time()),
        sa.Column("doors_close", sa.Time()),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("description_es", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("ticket_url", sa.String(500)),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.UniqueConstraint("number", name="uq_events_number"),
    )
    op.create_index("ix_events_published_date", "events", ["is_published", "event_date"])

    op.create_table(
        "event_artists",
        sa.Column(
            "event_id", sa.Integer(),
            sa.ForeignKey("events.id", name="fk_event_artists_event", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "artist_id", sa.Integer(),
            sa.ForeignKey("artists.id", name="fk_event_artists_artist", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("position", sa.SmallInteger(), nullable=False, server_default="0"),
    )
    op.create_index("ix_event_artists_artist", "event_artists", ["artist_id"])

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_login_at", sa.DateTime()),
        *_timestamps(),
        sa.UniqueConstraint("username", name="uq_admin_users_username"),
    )

    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id", sa.Integer(),
            sa.ForeignKey("admin_users.id", name="fk_admin_sessions_user", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("ip", sa.String(45)),
        sa.Column("user_agent", sa.String(255)),
        sa.UniqueConstraint("token_hash", name="uq_admin_sessions_token"),
    )
    op.create_index("ix_admin_sessions_user", "admin_sessions", ["user_id"])
    op.create_index("ix_admin_sessions_expires", "admin_sessions", ["expires_at"])

    op.create_table(
        "login_attempts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("ip", sa.String(45), nullable=False),
        sa.Column("succeeded", sa.Boolean(), nullable=False),
        sa.Column("attempted_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_login_attempts_user_time", "login_attempts", ["username", "attempted_at"])
    op.create_index("ix_login_attempts_ip_time", "login_attempts", ["ip", "attempted_at"])


def downgrade() -> None:
    op.drop_table("login_attempts")
    op.drop_table("admin_sessions")
    op.drop_table("admin_users")
    op.drop_table("event_artists")
    op.drop_table("events")
    op.drop_table("artist_links")
    op.drop_table("artists")

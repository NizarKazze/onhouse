"""Alembic environment. The database URL comes from app settings (env vars),
never from alembic.ini, so credentials stay out of the repository."""

from logging.config import fileConfig

from alembic import context

from app.config import get_settings
from app.db import build_engine
from app.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def _migration_settings():
    """Migrations prefer the direct connection: DDL through a transaction-mode
    pooler (Neon/Supabase "pooled" URLs) is not reliable."""
    settings = get_settings()
    if settings.database_url_unpooled:
        return settings.model_copy(update={"database_url": settings.database_url_unpooled})
    return settings


def run_migrations_offline() -> None:
    context.configure(
        url=_migration_settings().sqlalchemy_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = config.attributes.get("connection")
    if connectable is not None:
        _run(connectable)
        return
    engine = build_engine(_migration_settings())
    with engine.connect() as connection:
        _run(connection)
    engine.dispose()


def _run(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        render_as_batch=connection.dialect.name == "sqlite",
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

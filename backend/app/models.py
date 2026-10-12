"""ORM models. The schema itself is owned by the Alembic migrations in
`migrations/versions`; keep both in sync when changing a column."""

from datetime import date, datetime, time, timezone
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
    true,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    """Naive UTC — every DATETIME column in this schema is stored in UTC."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=utcnow, server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
        server_default=func.current_timestamp(),
    )


class LinkPlatform(StrEnum):
    instagram = "instagram"
    soundcloud = "soundcloud"
    spotify = "spotify"
    resident_advisor = "resident_advisor"
    beatport = "beatport"
    youtube = "youtube"
    tiktok = "tiktok"
    website = "website"


class Artist(TimestampMixin, Base):
    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    genre: Mapped[str] = mapped_column(String(80), nullable=False)
    description_en: Mapped[str | None] = mapped_column(Text)
    description_es: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=true()
    )

    links: Mapped[list["ArtistLink"]] = relationship(
        back_populates="artist",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ArtistLink.id",
    )
    event_links: Mapped[list["EventArtist"]] = relationship(
        back_populates="artist", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (Index("ix_artists_published_order", "is_published", "sort_order"),)


class ArtistLink(Base):
    __tablename__ = "artist_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artists.id", ondelete="CASCADE"), nullable=False
    )
    platform: Mapped[LinkPlatform] = mapped_column(
        Enum(
            LinkPlatform,
            native_enum=False,
            create_constraint=True,
            length=20,
            name="ck_artist_links_platform",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)

    artist: Mapped[Artist] = relationship(back_populates="links")

    __table_args__ = (UniqueConstraint("artist_id", "platform", name="uq_artist_links_platform"),)


class Event(TimestampMixin, Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Editorial edition number, shown as "001". Unique across all events.
    number: Mapped[int] = mapped_column(SmallInteger, nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    venue: Mapped[str | None] = mapped_column(String(120))  # NULL = TBA
    event_date: Mapped[date | None] = mapped_column(Date)  # NULL = TBA
    doors_open: Mapped[time | None] = mapped_column(Time)
    doors_close: Mapped[time | None] = mapped_column(Time)
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_es: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500))
    ticket_url: Mapped[str | None] = mapped_column(String(500))
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=true()
    )

    artist_links: Mapped[list["EventArtist"]] = relationship(
        back_populates="event",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="EventArtist.position",
    )

    __table_args__ = (Index("ix_events_published_date", "is_published", "event_date"),)


class EventArtist(Base):
    """Line-up: which artists play an event, in billing order."""

    __tablename__ = "event_artists"

    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), primary_key=True
    )
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artists.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    event: Mapped[Event] = relationship(back_populates="artist_links")
    artist: Mapped[Artist] = relationship(back_populates="event_links")

    __table_args__ = (Index("ix_event_artists_artist", "artist_id"),)


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=true()
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime)

    sessions: Mapped[list["AdminSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False
    )
    # SHA-256 of the cookie value; the raw token is never stored.
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ip: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(255))

    user: Mapped[AdminUser] = relationship(back_populates="sessions")

    __table_args__ = (
        Index("ix_admin_sessions_user", "user_id"),
        Index("ix_admin_sessions_expires", "expires_at"),
    )


class LoginAttempt(Base):
    """Failed/successful logins, used to throttle brute force. Kept in the
    database so limits hold across restarts and multiple instances."""

    __tablename__ = "login_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), nullable=False)
    ip: Mapped[str] = mapped_column(String(45), nullable=False)
    succeeded: Mapped[bool] = mapped_column(Boolean, nullable=False)
    attempted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    __table_args__ = (
        Index("ix_login_attempts_user_time", "username", "attempted_at"),
        Index("ix_login_attempts_ip_time", "ip", "attempted_at"),
    )

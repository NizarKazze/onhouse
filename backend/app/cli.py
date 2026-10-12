"""Management commands.

    python -m app.cli create-admin <username>   # prompts for the password
    python -m app.cli set-password <username>   # also revokes that user's sessions
    python -m app.cli seed                      # loads the site's launch content

Passwords are read interactively (or from ADMIN_PASSWORD for automation) so
they never end up in shell history or process listings.
"""

import argparse
import getpass
import os
import sys
from datetime import time

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import AdminUser, Artist, Event, EventArtist
from app.security.passwords import hash_password, validate_new_password
from app.security.sessions import revoke_all_for_user


def _read_password(username: str) -> str:
    password = os.environ.get("ADMIN_PASSWORD")
    if password is None:
        password = getpass.getpass("Password: ")
        if password != getpass.getpass("Repeat password: "):
            sys.exit("Passwords do not match")
    try:
        validate_new_password(password, username)
    except ValueError as exc:
        sys.exit(str(exc))
    return password


def create_admin(username: str) -> None:
    username = username.strip()
    if not 3 <= len(username) <= 64:
        sys.exit("Username must be 3-64 characters")
    with SessionLocal() as db:
        exists = db.scalar(select(AdminUser.id).where(func.lower(AdminUser.username) == username.lower()))
        if exists:
            sys.exit(f"Admin {username!r} already exists")
        db.add(AdminUser(username=username, password_hash=hash_password(_read_password(username))))
        db.commit()
    print(f"Admin {username!r} created")


def set_password(username: str) -> None:
    with SessionLocal() as db:
        user = db.scalar(select(AdminUser).where(func.lower(AdminUser.username) == username.lower()))
        if user is None:
            sys.exit(f"Admin {username!r} not found")
        user.password_hash = hash_password(_read_password(user.username))
        revoke_all_for_user(db, user.id)
        db.commit()
    print(f"Password updated for {username!r}; existing sessions revoked")


# Launch content — mirrors the frontend's former mock data.
SEED_EVENTS = [
    (1, "The first ONHOUSE night in Ibiza. Venue, date and line-up are being confirmed and will be announced here first.",
     "La primera noche ONHOUSE en Ibiza. Sala, fecha y cartel se están confirmando y se anunciarán aquí antes que en ningún otro sitio.",
     "/images/onh-next-poster.webp"),
    (2, "The second night. Long-form deep house, one room, doors from 23:59. Venue and line-up are confirmed closer to the date.",
     "La segunda noche. Deep house de sesión larga, una sola sala, puertas desde las 23:59. Sala y cartel se confirman cerca de la fecha.",
     None),
    (3, "A residents night. Two extended sets, no support slots, the room taken slowly from house into tech house.",
     "Noche de residentes. Dos sesiones largas, sin teloneros, llevando la sala del house al tech house poco a poco.",
     None),
    (4, "A guest-led session. One name, one uninterrupted set, announced here before anywhere else.",
     "Sesión con invitado. Un nombre, una sesión sin interrupciones, anunciada aquí antes que en ningún otro sitio.",
     None),
    (5, "Closing the first season. Full line-up, extended hours and the archive of the season opened the morning after.",
     "Cierre de la primera temporada. Cartel completo, horario ampliado y el archivo de la temporada abierto a la mañana siguiente.",
     None),
]
SEED_GENRES = ["HOUSE", "DEEP HOUSE", "TECH HOUSE", "HOUSE", "DEEP HOUSE", "TECH HOUSE"]


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Event)) or db.scalar(
            select(func.count()).select_from(Artist)
        ):
            sys.exit("Database already has content; seed only runs on an empty database")

        artists = [
            Artist(name="TBA", genre=genre, sort_order=index + 1)
            for index, genre in enumerate(SEED_GENRES)
        ]
        db.add_all(artists)
        db.flush()

        for number, en, es, image in SEED_EVENTS:
            event = Event(
                number=number,
                title=f"ONHOUSE {number:03d}",
                city="IBIZA",
                doors_open=time(23, 59),
                doors_close=time(6, 0),
                description_en=en,
                description_es=es,
                image_url=image,
            )
            if number == 1:
                event.artist_links = [
                    EventArtist(artist_id=a.id, position=i) for i, a in enumerate(artists)
                ]
            db.add(event)
        db.commit()
    print(f"Seeded {len(SEED_EVENTS)} events and {len(SEED_GENRES)} artists")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("create-admin").add_argument("username")
    sub.add_parser("set-password").add_argument("username")
    sub.add_parser("seed")
    args = parser.parse_args()

    if args.command == "create-admin":
        create_admin(args.username)
    elif args.command == "set-password":
        set_password(args.username)
    elif args.command == "seed":
        seed()


if __name__ == "__main__":
    main()

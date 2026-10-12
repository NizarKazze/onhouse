from typing import Annotated

from pydantic import StringConstraints

from app.schemas.common import InputModel, OutputModel

# Bounded so a huge password cannot be used to burn CPU in the hasher.
Username = Annotated[str, StringConstraints(min_length=1, max_length=64, strip_whitespace=True)]
Password = Annotated[str, StringConstraints(min_length=1, max_length=256, strip_whitespace=False)]


class LoginIn(InputModel):
    username: Username
    password: Password


class SessionOut(OutputModel):
    username: str
    # Must be echoed in the X-CSRF-Token header on every state-changing call.
    csrf_token: str

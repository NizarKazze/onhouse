"""pyproject.toml is what Vercel installs; requirements.txt is what local
`pip install -r` uses. They must list the same pinned runtime packages."""

import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_pyproject_matches_requirements() -> None:
    pyproject = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    requirements = [
        line.strip()
        for line in (ROOT / "requirements.txt").read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    assert sorted(pyproject["project"]["dependencies"]) == sorted(requirements)

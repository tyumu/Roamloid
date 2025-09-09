from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import List
import os
from dotenv import load_dotenv

# Load .env if present at project root or backend/
for candidate in (Path(__file__).resolve().parents[3]/'.env', Path(__file__).resolve().parents[2]/'.env'):
    if candidate.exists():
        load_dotenv(candidate)  # type: ignore
        break


def _split_list(value: str | None) -> List[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(',') if v.strip()]


@dataclass
class Settings:
    env: str = os.getenv('APP_ENV', 'development')
    debug: bool = os.getenv('DEBUG', '1') == '1'
    cors_origins: List[str] = None  # type: ignore
    firebase_credentials: str | None = os.getenv('FIREBASE_CREDENTIALS_JSON')

    def __post_init__(self):
        if self.cors_origins is None:
            self.cors_origins = _split_list(os.getenv('CORS_ORIGINS', '*')) or ['*']

    def as_flask_config(self) -> dict:
        return {
            'ENV': self.env,
            'DEBUG': self.debug,
        }


def load_settings() -> Settings:
    return Settings()

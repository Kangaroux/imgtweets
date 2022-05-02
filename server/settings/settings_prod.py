import os

from .settings import *


def getenv_or_fail(key: str):
    val = os.getenv(key)

    if not val:
        raise Exception(f"Error: Env '{key}' is required but is missing or empty.")

    return val


DEBUG = False
SECRET_KEY = getenv_or_fail("SECRET_KEY")
ALLOWED_HOSTS = ["*"]

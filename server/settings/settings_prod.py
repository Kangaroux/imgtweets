import os

from .settings import *


def getenv_or_fail(key: str):
    val = os.getenv(key)

    if not val:
        raise Exception(f"Error: Env '{key}' is required but is missing or empty.")

    return val


# Nginx is handling Host validation
ALLOWED_HOSTS = ["*"]
DEBUG = False
SECRET_KEY = getenv_or_fail("SECRET_KEY")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": getenv_or_fail("POSTGRES_DB"),
        "USER": getenv_or_fail("POSTGRES_USER"),
        "PASSWORD": getenv_or_fail("POSTGRES_PASSWORD"),
        "HOST": getenv_or_fail("POSTGRES_HOST"),
        "PORT": getenv_or_fail("POSTGRES_PORT"),
    }
}

REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {"standard": "30/minute", "fetch": "15/hour"},
}

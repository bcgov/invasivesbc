import logging
import os
from pathlib import Path
import sys
import shutil

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-&3i*dwyfxin1+336nfgz861&1z(56@qod5mq!^9f&-8y(r8qio"

DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.gis",
    "django_celery_beat",
    "ninja",
    "api",
    "corsheaders",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "api.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
        "TEST": {
            "NAME": os.getenv("TEST_DB_NAME"),
        },
        "CONN_MAX_AGE": 0,
        "ATOMIC_REQUESTS": True,  # sensible default - caution that it only applies to Views
        "OPTIONS": {
            "pool": {
                "min_size": 2,
                "max_size": 8,
                "timeout": 30,
                "max_lifetime": 1800,
                "max_idle": 900,
            },
        },
    }
}
LEGACY_DB = {
    "NAME": os.getenv("LEGACY_DB_NAME"),
    "USER": os.getenv("LEGACY_DB_USER"),
    "PASSWORD": os.getenv("LEGACY_DB_PASSWORD"),
    "HOST": os.getenv("LEGACY_DB_HOST"),
    "PORT": os.getenv("DB_PORT"),
}

CELERY_BROKER_URL = os.getenv(
    "CELERY_BROKER_URL", "amqp://guest:guest@localhost:5672//"
)  # rabbitmq defaults if unspecified (for local dev)
CELERY_TIMEZONE = "America/Vancouver"
CELERY_TASK_TRACK_STARTED = True
CELERY_ACCEPT_CONTENT = ["pickle", "json"]
CELERY_TASK_SERIALIZER = "pickle"  # by default - more efficient than json, less compatible with other platforms though
CELERY_TASK_ACKS_LATE = True # enable re-queuing on worker loss

"""
Settings related to map generation and tile caching
"""

SCRATCH_DIRECTORY = os.getenv("SCRATCH_DIRECTORY", os.getcwd())

os.makedirs(SCRATCH_DIRECTORY, exist_ok=True)

disk_space = shutil.disk_usage(SCRATCH_DIRECTORY)

TILE_CACHE_MAXIMUM_SIZE = int(
    os.getenv("TILE_CACHE_MAXIMUM_SIZE", "4294967296")  # default to 4GB
)

if disk_space.free < TILE_CACHE_MAXIMUM_SIZE:
    TILE_CACHE_MAXIMUM_SIZE = int(
        disk_space.free * 0.75
    )  # don't use more than 3/4 of the available space for the cache

# store frequently-used low-zoom tiles locally for faster retrieval.
# this cache is NOT shared between workers
LOCAL_CACHE_ZOOM_RANGE = range(0, 13 + 1)

# store more tiles in the database for shared access (across workers)
# slower but bigger (level 2 cache)
DATABASE_CACHE_ZOOM_RANGE = range(0, 18 + 1)

"""
end of map generation settings
"""

KEYCLOAK = {
    "JWKS_ENDPOINT": os.getenv(
        "JWKS_ENDPOINT",
        "https://loginproxy.gov.bc.ca/auth/realms/standard/.well-known/openid-configuration",
    ),
    "AUDIENCE": os.getenv("JWT_AUDIENCE", "invasivesbc"),
}

KEYCLOAK_AUDIENCE = os.getenv("KEYCLOAK_AUDIENCE", "invasives")

UNIT_TESTING_ENABLED = False

LEGACY_DB_CONNECTION_STRING = f"dbname={LEGACY_DB['NAME']} host={LEGACY_DB['HOST']} port={LEGACY_DB["PORT"]} user={LEGACY_DB['USER']} password={LEGACY_DB['PASSWORD']}"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "COMPACT_JSON": False,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "api.keycloak_authentication.UserAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_PAGINATION_CLASS": None,
    "PAGE_SIZE": 999999999,
}

AUTH_USER_MODEL = "api.User"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    },
    "keycloak": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "keycloak",
    },
}

DATABASE_ROUTERS = ["api.db_router.InvasivesDBRouter"]

LANGUAGE_CODE = "en-ca"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://normalization-appv2-dev-invasivesbci.apps.silver.devops.gov.bc.ca",
    "https://normalization-fe-dev-invasivesbci.apps.silver.devops.gov.bc.ca",
    "https://normalization-fe-prod-invasivesbci.apps.silver.devops.gov.bc.ca",
    "https://invasivesbc.gov.bc.ca",
    "invasivesbc://localhost"
]

CORS_EXPOSE_HEADERS = ["Content-Disposition"]

OBJECT_STORE_ENDPOINT_URL = os.getenv(
    "OBJECT_STORE_ENDPOINT_URL", "http://localhost:9000"
)
OBJECT_STORE_ACCESS_KEY_ID = os.getenv("OBJECT_STORE_ACCESS_KEY_ID", "unset")
OBJECT_STORE_SECRET_ACCESS_KEY = os.getenv("OBJECT_STORE_SECRET_ACCESS_KEY", "unset")
OBJECT_STORE_MAP_UPLOAD_BUCKET = os.getenv("OBJECT_STORE_MAP_UPLOAD_BUCKET", "maps")
OBJECT_STORE_REGION = os.getenv(
    "OBJECT_STORE_REGION", "unset"
)  # certain operations, like generating pre-signed URLS, require this to match the service expectation


LOG_LEVEL = os.getenv("DJANGO_LOGGING_LEVEL", "INFO")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "[{levelname}][{module}][{asctime}]: {message}",
            "style": "{",
        }
    },
    "handlers": {
        "timestamped": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "simple",
            "level": LOG_LEVEL,
        },
    },
    "loggers": {
        "": {
            "handlers": ["timestamped"],
            "level": "DEBUG",
        },
        "django": {
            "handlers": ["timestamped"],
            "level": "DEBUG",
            "propagate": False,
        },
        "psycopg": {
            "handlers": ["timestamped"],
            "level": "DEBUG",
            "propagate": False,
        },
        "psycopg.pool": {
          "handlers": ["timestamped"],
          "level": "WARNING",
          "propagate": False,
        },
        "invasives": {
            "handlers": ["timestamped"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
}

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-&3i*dwyfxin1+336nfgz861&1z(56@qod5mq!^9f&-8y(r8qio"

DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = ["django.contrib.contenttypes", "api", "corsheaders"]

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
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
    }
}
LEGACY_DB = {
    "NAME": os.getenv("LEGACY_DB_NAME"),
    "USER": os.getenv("LEGACY_DB_USER"),
    "PASSWORD": os.getenv("LEGACY_DB_PASSWORD"),
    "HOST": os.getenv("LEGACY_DB_HOST"),
}

LEGACY_DB_CONNECTION_STRING = f"dbname={LEGACY_DB['NAME']} host={LEGACY_DB['HOST']} user={LEGACY_DB['USER']} password={LEGACY_DB['PASSWORD']}"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "COMPACT_JSON": False,
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
}

LANGUAGE_CODE = "en-ca"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
]
CORS_EXPOSE_HEADERS = ["Content-Disposition"]

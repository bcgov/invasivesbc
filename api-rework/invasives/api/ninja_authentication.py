import json
import logging

import jwt
import requests
from django.conf import settings
from ninja.security import HttpBearer
from typing import Optional
from ninja.errors import HttpError
from api.constants import WellKnownRoles
from api.keycloak_authentication import (
    update_user_attributes_if_needed,
    user_is_expired,
)
from api.models.auth import User


class NinjaKeycloakAuthentication(HttpBearer):

    jwks_client = None
    jwks_uri = None
    jwks = None

    def refresh_jwk(self):
        oidc_response = requests.get(settings.KEYCLOAK["JWKS_ENDPOINT"])
        jwks_uri = json.loads(oidc_response.text)["jwks_uri"]
        self.jwks_uri = jwks_uri
        certs_response = requests.get(jwks_uri)
        jwks = json.loads(certs_response.text)
        self.jwks = jwks

    def authenticate(self, request, token) -> Optional[User]:
        """Verify the JWT and do user lookup"""

        if not token:
            logging.warning("No token found")
            return None

        try:
            if not self.jwks_uri or not self.jwks_client:
                # Cache discovery per instance; tests mock the remote responses.
                self.refresh_jwk()
                self.jwks_client = jwt.PyJWKClient(
                    self.jwks_uri, cache_keys=True, cache_jwk_set=True
                )
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
        except (jwt.PyJWKClientConnectionError, requests.RequestException):
            logging.error("Unable to retrieve signing keys", exc_info=True)
            raise HttpError(503, "Unable to verify authentication")
        except jwt.PyJWTError:
            logging.warning("Invalid token or signing key")
            return None

        try:
            user_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK["AUDIENCE"],
                options={"verify_exp": True, "require": ["sub"]},
            )
        except jwt.InvalidTokenError:
            logging.warning("Invalid or expired token")
            return None

        if not user_token:
            return None

        user, _ = User.objects.get_or_create(subject=user_token["sub"])
        if user_is_expired(user):
            logging.warning("Expired user attempted authentication")
            return None

        update_user_attributes_if_needed(user, user_token)
        return user


class NinjaAnyRoleRequired(NinjaKeycloakAuthentication):
    def authenticate(self, request, token):
        user = super().authenticate(request, token)
        if not user:
            return None
        if not user.roles.exists():
            raise HttpError(403, "Insufficient Permissions to access resource")
        return user


class NinjaRoleRequired(NinjaAnyRoleRequired):
    def __init__(self, *roles: WellKnownRoles):
        super().__init__()
        self.roles = frozenset(r.value if hasattr(r, "value") else r for r in roles)

    def authenticate(self, request, token):
        user = super().authenticate(request, token)
        if not user:
            return None
        if user.has_any_role(self.roles) == False:
            raise HttpError(403, "Insufficient Permissions to access resource")
        return user

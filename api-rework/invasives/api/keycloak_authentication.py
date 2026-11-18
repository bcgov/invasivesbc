import json
import logging

import jwt
import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.utils import DatabaseError
from rest_framework import authentication, exceptions

from api.utils.timezones import local_today
from api.models.auth import User


class AuthenticationServiceUnavailable(exceptions.APIException):
    status_code = 503
    default_detail = "Unable to verify authentication"
    default_code = "authentication_service_unavailable"


def update_user_attributes_if_needed(user: User, user_token: dict):
    today = local_today()

    if user.last_seen != today:
        User.objects.filter(subject=user_token["sub"]).update(last_seen=today)

    email = user_token["email"] if "email" in user_token else None

    display_name = user_token["display_name"] if "display_name" in user_token else None

    if display_name is None and "name" in user_token and user_token["name"] is not None:
        display_name = user_token["name"]

    if user.email != email or user.display_name != display_name:
        try:
            User.objects.filter(subject=user_token["sub"]).update(
                email=email,
                display_name=display_name,
            )
        except (DatabaseError, ValidationError):
            logging.warning("Error updating user email or display name", exc_info=True)


def user_is_expired(user: User) -> bool:
    """True if the user's expiry date is strictly earlier than today."""
    return user.expiry_date is not None and user.expiry_date < local_today()


class UserAuthentication(authentication.BaseAuthentication):

    jwks_client = None
    jwks_uri = None
    jwks = None

    def authenticate_header(self, request):
        return "Bearer"

    def refresh_jwk(self):
        oidc_response = requests.get(settings.KEYCLOAK["JWKS_ENDPOINT"])
        jwks_uri = json.loads(oidc_response.text)["jwks_uri"]
        self.jwks_uri = jwks_uri
        certs_response = requests.get(jwks_uri)
        jwks = json.loads(certs_response.text)
        self.jwks = jwks

    def authenticate(self, request):
        """Verify the JWT and do user lookup"""

        auth = request.META.get("HTTP_AUTHORIZATION", None)

        if not auth:
            logging.warning("Authorization header required")
            raise exceptions.AuthenticationFailed("Authorization header required")

        try:
            scheme, token = auth.split()
        except ValueError:
            logging.warning("Invalid format for authorization header")
            raise exceptions.AuthenticationFailed(
                "Invalid format for authorization header"
            )
        if scheme != "Bearer":
            logging.warning("Authorization header invalid")
            raise exceptions.AuthenticationFailed("Authorization header invalid")

        if not token:
            logging.warning("No token found")
            raise exceptions.AuthenticationFailed("No token found")

        try:
            if not self.jwks_uri or not self.jwks_client:
                # Cache discovery per instance; tests mock the remote responses.
                self.refresh_jwk()
                self.jwks_client = jwt.PyJWKClient(
                    self.jwks_uri, cache_keys=True, cache_jwk_set=True
                )
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
        except (jwt.PyJWKClientConnectionError, requests.RequestException) as exc:
            logging.error("Unable to retrieve signing keys", exc_info=True)
            raise AuthenticationServiceUnavailable() from exc
        except jwt.PyJWTError as exc:
            logging.warning("Invalid token or signing key")
            raise exceptions.AuthenticationFailed(
                "Invalid token or signing key"
            ) from exc

        try:
            user_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK["AUDIENCE"],
                options={"verify_exp": True, "require": ["sub"]},
            )
        except jwt.InvalidTokenError as exc:
            logging.warning("Invalid or expired token")
            raise exceptions.AuthenticationFailed("Invalid or expired token") from exc

        user, _ = User.objects.get_or_create(subject=user_token["sub"])

        if user_is_expired(user):
            logging.warning("Expired user attempted authentication")
            raise exceptions.AuthenticationFailed("User account has expired")

        update_user_attributes_if_needed(user, user_token)

        logging.debug(f"User roles: [{','.join(r.name for r in user.roles.all())}]")
        return user, None

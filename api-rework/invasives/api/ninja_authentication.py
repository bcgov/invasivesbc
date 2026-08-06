import json
import logging

import jwt
import requests
from django.conf import settings
from ninja.security import HttpBearer
from rest_framework import exceptions

from api.keycloak_authentication import update_user_attributes_if_needed
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

    def authenticate(self, request, token):
        """Verify the JWT and do user lookup"""

        if settings.UNIT_TESTING_ENABLED:
            user, _ = User.objects.get_or_create(subject="test-user")
            return user

        if not token:
            logging.warning("No token found")
            raise exceptions.AuthenticationFailed("No token found")

        token_validation_errors = []

        if not self.jwks_uri or not self.jwks_client:
            # should only need to be done once. we don't do it when testing though.
            self.refresh_jwk()
            self.jwks_client = jwt.PyJWKClient(
                self.jwks_uri, cache_keys=True, cache_jwk_set=True
            )

        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
        except Exception as exc:
            logging.warning("error retrieving signing key", exc_info=True)
            token_validation_errors.append(exc)
            raise Exception(str(exc))

        try:
            user_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK["AUDIENCE"],
                options={"verify_exp": True},
            )
        except (jwt.InvalidTokenError, jwt.DecodeError) as exc:
            token_validation_errors.append(exc)
            raise Exception(str(exc))

        if not user_token:
            raise exceptions.AuthenticationFailed(
                "No successful decode of user token. Exceptions occurred: {}",
                "\n".join([str(error) for error in token_validation_errors]),
            )

        user, _ = User.objects.get_or_create(subject=user_token["sub"])
        update_user_attributes_if_needed(user, user_token)
        return user

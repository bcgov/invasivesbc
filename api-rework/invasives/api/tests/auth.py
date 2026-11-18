"""Signed test credentials; only OIDC/JWKS retrieval is mocked.

Use ``self.auth_headers("bc_biocontrol")`` for individual requests or
``self.client_for("bc_admin")`` for an authenticated Django client. Names must
refer to existing database users. Roles always come from the database, not JWTs.
"""

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from unittest.mock import patch

import jwt
import requests
from cryptography.hazmat.primitives.asymmetric import rsa
from django.test import Client, override_settings

from api.models.auth import User

DISCOVERY_URL = "https://keycloak.test/.well-known/openid-configuration"
JWKS_URL = "https://keycloak.test/certs"
AUDIENCE = "invasivesbc-tests"
KEY_ID = "test-signing-key"


@lru_cache(maxsize=1)
def signing_key():
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def public_jwks():
    key = jwt.algorithms.RSAAlgorithm.to_jwk(signing_key().public_key(), as_dict=True)
    return {"keys": [{**key, "kid": KEY_ID, "use": "sig", "alg": "RS256"}]}


def token_for(user: User, **claim_overrides):
    now = datetime.now(timezone.utc)
    claims = {
        "sub": user.subject,
        "aud": AUDIENCE,
        "iat": now,
        "exp": now + timedelta(minutes=5),
        "email": user.email,
        "display_name": user.display_name,
        **claim_overrides,
    }
    return jwt.encode(claims, signing_key(), algorithm="RS256", headers={"kid": KEY_ID})


class JWTAuthenticationMixin:
    """Run both real authenticators with isolated, in-memory signing keys."""

    def setUp(self):
        super().setUp()
        settings = override_settings(
            KEYCLOAK={"JWKS_ENDPOINT": DISCOVERY_URL, "AUDIENCE": AUDIENCE}
        )
        settings.enable()
        self.addCleanup(settings.disable)
        self.discovery_mock = self.enterContext(
            patch("requests.get", side_effect=self._discovery_response)
        )
        self.jwks_mock = self.enterContext(
            patch.object(jwt.PyJWKClient, "fetch_data", autospec=True)
        )
        self.jwks_mock.side_effect = self._fetch_jwks

        # Ninja keeps authenticator instances on operations across test cases.
        from api.ninja_authentication import NinjaKeycloakAuthentication
        from api.urls import ninja_api

        authenticators = {
            auth
            for router in ninja_api._get_bound_routers()
            for view in router.path_operations.values()
            for operation in view.operations
            for auth in operation.auth_callbacks
            if isinstance(auth, NinjaKeycloakAuthentication)
        }
        for auth in authenticators:
            for attribute in ("jwks_client", "jwks_uri", "jwks"):
                self.enterContext(patch.object(auth, attribute, None))

    @staticmethod
    def _discovery_response(url, **kwargs):
        documents = {
            DISCOVERY_URL: {"jwks_uri": JWKS_URL},
            JWKS_URL: public_jwks(),
        }
        if url not in documents:
            raise AssertionError(f"Unexpected authentication URL: {url}")
        response = requests.Response()
        response.status_code = 200
        response._content = json.dumps(documents[url]).encode()
        return response

    @staticmethod
    def _fetch_jwks(client):
        if client.uri != JWKS_URL:
            raise AssertionError(f"Unexpected JWKS URL: {client.uri}")
        keys = deepcopy(public_jwks())
        if client.jwk_set_cache is not None:
            client.jwk_set_cache.put(keys)
        return keys

    def auth_headers(self, user: User | str, **claim_overrides):
        if isinstance(user, str):
            user = User.objects.get(subject=user)
        return {"Authorization": f"Bearer {token_for(user, **claim_overrides)}"}

    def client_for(self, user: User | str):
        return Client(headers=self.auth_headers(user))

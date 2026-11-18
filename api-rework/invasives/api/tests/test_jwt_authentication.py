from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import jwt
import requests
from cryptography.hazmat.primitives.asymmetric import rsa
from django.conf import settings
from django.test import RequestFactory, SimpleTestCase
from ninja.errors import HttpError
from rest_framework.exceptions import AuthenticationFailed

from api.keycloak_authentication import (
    AuthenticationServiceUnavailable,
    UserAuthentication,
)
from api.models.auth import User
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.tests.auth import (
    AUDIENCE,
    JWKS_URL,
    KEY_ID,
    JWTAuthenticationMixin,
    signing_key,
    token_for,
)
from api.tests.base_test_case import BaseTestCase
from api.utils.timezones import local_today


class JWTAuthenticationTests(BaseTestCase):
    def authenticate(self, framework, token):
        request = RequestFactory().get(
            "/", headers={"Authorization": f"Bearer {token}"}
        )
        if framework == "ninja":
            return NinjaKeycloakAuthentication().authenticate(request, token)
        return UserAuthentication().authenticate(request)[0]

    def assert_rejected(self, token):
        for framework in ("ninja", "drf"):
            with self.subTest(framework=framework):
                with self.assertLogs(level="WARNING"):
                    if framework == "ninja":
                        self.assertIsNone(self.authenticate(framework, token))
                    else:
                        with self.assertRaises(AuthenticationFailed):
                            self.authenticate(framework, token)

    def test_valid_tokens_identify_database_users_without_changing_roles(self):
        for framework in ("ninja", "drf"):
            for subject in self.usernames:
                with self.subTest(framework=framework, subject=subject):
                    user = User.objects.get(subject=subject)
                    roles = set(user.roles.values_list("name", flat=True))
                    result = self.authenticate(framework, token_for(user))
                    self.assertEqual(result.pk, user.pk)
                    self.assertEqual(
                        set(result.roles.values_list("name", flat=True)), roles
                    )

    def test_signature_audience_expiry_and_subject_are_validated(self):
        user = User.objects.get(subject="bc_admin")
        now = datetime.now(timezone.utc)
        claims = {
            "sub": user.subject,
            "aud": AUDIENCE,
            "exp": now + timedelta(minutes=5),
        }
        wrong_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        invalid_tokens = {
            "signature": jwt.encode(
                claims, wrong_key, algorithm="RS256", headers={"kid": KEY_ID}
            ),
            "audience": token_for(user, aud="another-api"),
            "expiry": token_for(user, exp=now - timedelta(minutes=1)),
            "future": token_for(user, nbf=now + timedelta(minutes=5)),
            "missing subject": jwt.encode(
                {"aud": AUDIENCE},
                signing_key(),
                algorithm="RS256",
                headers={"kid": KEY_ID},
            ),
            "unknown key": jwt.encode(
                claims, signing_key(), algorithm="RS256", headers={"kid": "unknown"}
            ),
            "malformed": "invalid-token",
        }
        for reason, token in invalid_tokens.items():
            with self.subTest(reason=reason):
                self.assert_rejected(token)

    def test_invalid_token_does_not_create_or_modify_users(self):
        user = User.objects.get(subject="bc_noroles")
        before = list(
            User.objects.values("subject", "display_name", "email", "last_seen")
        )
        self.assert_rejected(
            token_for(
                user, aud="wrong", sub="untrusted-subject", display_name="changed"
            )
        )
        self.assertEqual(
            list(User.objects.values("subject", "display_name", "email", "last_seen")),
            before,
        )
        self.assertFalse(user.roles.exists())

    def test_new_subject_is_provisioned_without_roles(self):
        user = User.objects.get(subject="bc_noroles")
        for framework in ("ninja", "drf"):
            with self.subTest(framework=framework):
                subject = f"new-{framework}"
                result = self.authenticate(framework, token_for(user, sub=subject))
                self.assertEqual(result.subject, subject)
                self.assertFalse(result.roles.exists())

    def test_signed_claims_update_profile(self):
        user = User.objects.get(subject="bc_noroles")
        for framework in ("ninja", "drf"):
            with self.subTest(framework=framework):
                self.authenticate(
                    framework,
                    token_for(
                        user, display_name=framework, email=f"{framework}@test.local"
                    ),
                )
                user.refresh_from_db()
                self.assertEqual(user.display_name, framework)
                self.assertEqual(user.email, f"{framework}@test.local")
                self.assertEqual(user.last_seen, local_today())
                self.assertFalse(user.roles.exists())

    def test_missing_and_malformed_credentials_return_401(self):
        for path in ("/ninja/auth/user", "/activities"):
            for header in (None, "", "Basic token", "Bearer", "Bearer invalid-token"):
                with self.subTest(path=path, header=header):
                    headers = {"Authorization": header} if header is not None else {}
                    response = self.client.get(path, headers=headers)
                    self.assertEqual(response.status_code, 401, response.content)

    def test_named_clients_keep_principals_separate(self):
        admin = self.client_for("bc_admin")
        roleless = self.client_for("bc_noroles")
        for client, subject, expected in (
            (admin, "bc_admin", 200),
            (roleless, "bc_noroles", 403),
            (admin, "bc_admin", 200),
        ):
            with self.subTest(subject=subject):
                profile = client.get("/ninja/auth/user")
                self.assertEqual(profile.status_code, 200, profile.content)
                self.assertEqual(profile.json()["subject"], subject)
                response = client.get("/activities")
                self.assertEqual(response.status_code, expected, response.content)
        self.assertEqual(self.client.get("/ninja/auth/user").status_code, 401)

    def test_missing_named_user_is_a_fixture_error(self):
        with self.assertRaises(User.DoesNotExist):
            self.client_for("missing-fixture-user")

    def test_jwks_failure_returns_service_unavailable(self):
        token = token_for(User.objects.get(subject="bc_admin"))
        self.jwks_mock.side_effect = jwt.PyJWKClientConnectionError("unavailable")
        with self.assertLogs(level="ERROR"):
            with self.assertRaises(HttpError) as ninja_error:
                self.authenticate("ninja", token)
            with self.assertRaises(AuthenticationServiceUnavailable):
                self.authenticate("drf", token)
        self.assertEqual(ninja_error.exception.status_code, 503)

    def test_discovery_failure_returns_service_unavailable(self):
        self.discovery_mock.side_effect = requests.ConnectionError("unavailable")
        for path in ("/ninja/auth/user", "/activities"):
            with self.subTest(path=path), self.assertLogs(level="ERROR"):
                response = self.client.get(path, headers=self.auth_headers("bc_admin"))
                self.assertEqual(response.status_code, 503, response.content)

    def test_authentication_makes_no_live_network_requests(self):
        with patch(
            "urllib.request.OpenerDirector.open",
            side_effect=AssertionError("Live JWKS request"),
        ), patch(
            "requests.sessions.Session.request",
            side_effect=AssertionError("Live discovery request"),
        ):
            for framework in ("ninja", "drf"):
                with self.subTest(framework=framework):
                    user = User.objects.get(subject="bc_admin")
                    self.assertEqual(
                        self.authenticate(framework, token_for(user)).pk, user.pk
                    )
        self.assertTrue(self.discovery_mock.called)
        self.assertTrue(self.jwks_mock.called)


class AuthenticationFixtureLifecycleTests(SimpleTestCase):
    def test_cleanup_restores_keycloak_settings_mocks_and_router_keys(self):
        from api.protocol.auth.api import router

        class AuthenticationCase(JWTAuthenticationMixin, SimpleTestCase):
            pass

        auth = router.path_operations["/user"].operations[0].auth_callbacks[0]
        original_settings = settings.KEYCLOAK
        original_get = requests.get
        original_fetch = jwt.PyJWKClient.fetch_data
        original_client = auth.jwks_client
        original_uri = auth.jwks_uri
        case = AuthenticationCase()
        try:
            case.setUp()
            self.assertEqual(settings.KEYCLOAK["AUDIENCE"], AUDIENCE)
            self.assertIsNone(auth.jwks_client)
            auth.jwks_client = jwt.PyJWKClient(JWKS_URL)
            auth.jwks_uri = JWKS_URL
            with self.assertRaisesRegex(
                AssertionError, "Unexpected authentication URL"
            ):
                requests.get("https://unexpected.test")
            with self.assertRaisesRegex(AssertionError, "Unexpected JWKS URL"):
                jwt.PyJWKClient("https://unexpected.test").fetch_data()
        finally:
            case.doCleanups()

        self.assertIs(settings.KEYCLOAK, original_settings)
        self.assertIs(requests.get, original_get)
        self.assertIs(jwt.PyJWKClient.fetch_data, original_fetch)
        self.assertIs(auth.jwks_client, original_client)
        self.assertEqual(auth.jwks_uri, original_uri)

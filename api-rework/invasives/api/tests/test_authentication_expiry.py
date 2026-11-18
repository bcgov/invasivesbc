import datetime

from django.test import RequestFactory
from rest_framework import exceptions

from api.keycloak_authentication import UserAuthentication
from api.models.auth import User
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.tests.auth import token_for
from api.tests.base_test_case import BaseTestCase
from api.utils.timezones import local_today


class AuthenticationExpiryTests(BaseTestCase):
    def _user(self, expiry_date):
        user = User.objects.get(subject="bc_admin")
        user.expiry_date = expiry_date
        user.save(update_fields=["expiry_date"])
        return user

    def test_ninja_accepts_unexpired_user(self):
        for expiry in (
            None,
            local_today(),
            local_today() + datetime.timedelta(days=1),
        ):
            with self.subTest(expiry=expiry):
                user = self._user(expiry)
                result = NinjaKeycloakAuthentication().authenticate(
                    RequestFactory().get("/"), token_for(user)
                )
                self.assertEqual(result.subject, user.subject)

    def test_ninja_rejects_expired_user(self):
        user = self._user(local_today() - datetime.timedelta(days=1))
        with self.assertLogs(level="WARNING"):
            result = NinjaKeycloakAuthentication().authenticate(
                RequestFactory().get("/"), token_for(user)
            )
        self.assertIsNone(result)

    def test_keycloak_accepts_unexpired_user(self):
        for expiry in (
            None,
            local_today(),
            local_today() + datetime.timedelta(days=1),
        ):
            with self.subTest(expiry=expiry):
                user = self._user(expiry)
                request = RequestFactory().get("/", headers=self.auth_headers(user))
                result, _ = UserAuthentication().authenticate(request)
                self.assertEqual(result.subject, user.subject)

    def test_keycloak_rejects_expired_user(self):
        user = self._user(local_today() - datetime.timedelta(days=1))
        request = RequestFactory().get("/", headers=self.auth_headers(user))
        with self.assertLogs(level="WARNING"):
            with self.assertRaises(exceptions.AuthenticationFailed):
                UserAuthentication().authenticate(request)

import datetime
from unittest.mock import MagicMock

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import exceptions

from api.keycloak_authentication import UserAuthentication
from api.models.auth import User
from api.ninja_authentication import NinjaKeycloakAuthentication


@override_settings(UNIT_TESTING_ENABLED=True)
class AuthenticationExpiryTests(TestCase):
    def _user(self, expiry_date):
        return User.objects.update_or_create(
            subject="test-user", defaults={"expiry_date": expiry_date}
        )[0]

    def _ninja_request(self):
        request = MagicMock()
        request.META = {"HTTP_AUTHORIZATION": "Bearer x act_as_user=test-user"}
        return request

    def _drf_request(self):
        request = MagicMock()
        request.META = {"HTTP_AUTHORIZATION": "Bearer x"}
        return request

    def test_ninja_accepts_unexpired_user(self):
        for expiry in (
            None,
            timezone.localdate(),
            timezone.localdate() + datetime.timedelta(days=1),
        ):
            self._user(expiry)
            result = NinjaKeycloakAuthentication().authenticate(
                self._ninja_request(), "x"
            )
            self.assertEqual(result.subject, "test-user")

    def test_ninja_rejects_expired_user(self):
        self._user(timezone.localdate() - datetime.timedelta(days=1))
        result = NinjaKeycloakAuthentication().authenticate(self._ninja_request(), "x")
        self.assertIsNone(result)

    def test_keycloak_accepts_unexpired_user(self):
        for expiry in (
            None,
            timezone.localdate(),
            timezone.localdate() + datetime.timedelta(days=1),
        ):
            self._user(expiry)
            user, _ = UserAuthentication().authenticate(self._drf_request())
            self.assertEqual(user.subject, "test-user")

    def test_keycloak_rejects_expired_user(self):
        self._user(timezone.localdate() - datetime.timedelta(days=1))
        with self.assertRaises(exceptions.AuthenticationFailed):
            UserAuthentication().authenticate(self._drf_request())

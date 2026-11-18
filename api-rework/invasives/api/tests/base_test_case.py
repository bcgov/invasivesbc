from django.test import TestCase

from api.tests.auth import JWTAuthenticationMixin


class BaseTestCase(JWTAuthenticationMixin, TestCase):
    base_fixtures = (
        "all_codes",
        "test/common/test_employer_codes",
        "test/common/test_funding_agency_codes",
        "test/common/base_authentication",
    )
    fixtures = base_fixtures

    usernames = [
        "bc_admin",
        "bc_biocontrol",
        "bc_datamanager",
        "bc_noroles",
    ]

    extra_fixtures = ()

    @classmethod
    def setUpClass(cls):
        """Retain base and parent fixtures without modifying inherited lists."""
        fixtures = list(cls.base_fixtures)
        for base in reversed(cls.__mro__):
            fixtures.extend(base.__dict__.get("extra_fixtures", ()))
        cls.fixtures = list(dict.fromkeys(fixtures))
        super().setUpClass()

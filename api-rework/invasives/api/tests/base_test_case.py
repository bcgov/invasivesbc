from django.test import TestCase, override_settings


@override_settings(UNIT_TESTING_ENABLED=True)
class BaseTestCase(TestCase):
    fixtures = [
        "test/common/base_authentication",
    ]

    usernames = [
        "bc_admin",
        "bc_biocontrol",
        "bc_datamanager",
        "bc_noroles",
    ]

    extra_fixtures = None

    @classmethod
    def setUpClass(cls):
        if cls.extra_fixtures is not None:
            cls.fixtures = cls.fixtures + cls.extra_fixtures
        super().setUpClass()

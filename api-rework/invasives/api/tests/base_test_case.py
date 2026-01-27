from django.test import TestCase, override_settings


@override_settings(UNIT_TESTING_ENABLED=True)
class BaseTestCase(TestCase):
    pass

from abc import ABC

from django.test.client import Client
from django.test import override_settings

from api.models.activity.activity import Activity
from api.serializers.activity import ActivitySerializer
from api.tests.base_test_case import BaseTestCase


@override_settings(UNIT_TESTING_ENABLED=True)
class BaseActivitySubtypeTest(BaseTestCase, ABC):
    """
    Base Class for Activity Subtypes to inherit off for common functionality/test-cases.
    Contains:
      - Common Variables
      - Common Helper Methods
      - Common Tests
    """

    ID_A = "6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7"
    ID_B = "CD542709-F767-402F-818E-117B3FBC797D"

    #######
    # Helper Methods
    #######

    def fetch(self, id):
        client = Client()
        result = client.get(
            f"/activities/{id}",
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(result.status_code, 200)
        return result

    def fetch_a(self):
        return self.fetch(self.ID_A)

    def fetch_b(self):
        return self.fetch(self.ID_B)

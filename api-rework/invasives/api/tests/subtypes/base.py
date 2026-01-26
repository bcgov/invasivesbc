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

    #######
    # Cross-Subtype tests
    #######

    def expect_two_activities(self):
        """
        Test that there are are two activities in a record result (imported by fixtures)
        """
        result = self.client.get(
            "/activities", headers={"Authorization": "Bearer act_as_user=test_user"}
        )
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(len(response_object), 2)

    def no_pac_number_present(self):
        """
        Tests that the records do not contain a pesticide application number under participants
        """
        try:
            record = Activity.objects.get(id=self.ID_A)
            self.assertIsNotNone(record)
            serial = ActivitySerializer(record)
            participants = serial.data["participants"]
            self.assertGreaterEqual(len(participants), 1)
            for person in participants:
                self.assertIsNotNone(person.get("name"))
                self.assertIsNone(person.get("pac_number"))

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def pac_number_is_present(self):
        """Tests that the records contain pesticide application numbers under participants (Chemical Treatments)"""
        try:
            record = Activity.objects.get(id=self.ID_A)
            self.assertIsNotNone(record)
            serial = ActivitySerializer(record)
            serial.data["participants"]

            for person in serial.data["participants"]:
                self.assertIsNotNone(person.get("name"))
                self.assertIsNotNone(person.get("pac_number"))

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def casting_fixture_into_serializer(self, expected_subtype_key):
        """
        Test casting the record data into an ActivitySerializer.

        :param expected_subtype_key: An anticipated key for the subtype being casted. e.g.: 'well_information'
        """
        try:
            record = Activity.objects.get(id=self.ID_A)
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)
            # Check a subtype specific field
            self.assertIsNotNone(serial.data["subtype_data"][expected_subtype_key])

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

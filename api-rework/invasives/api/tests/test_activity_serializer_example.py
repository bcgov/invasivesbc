from django.test import TestCase
from django.test.client import Client

from api.tests.base_test_case import BaseTestCase


class ActivitySerializerTest(BaseTestCase):

    fixtures = [
        "test/common/test_activities.json",
        "test/common/test_jurisdictions.json",
        "test/common/test_funding_agency.json",
        "test/common/test_employer.json",
    ]

    def test_expect_two_activities(self):
        """Verify that two activities are returned from the list endpoint"""
        client = Client()
        result = client.get(
            "/activities",
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(len(response_object), 2)

    def test_activity_comment(self):
        """Test that the serialized comment contains the expected string"""
        client = Client()
        result = client.get(
            "/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7",
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(response_object["comment"], "The test looks for this comment")

    def test_jurisdictions_populate_one_entry(self):
        """Test that the serialized data contains information from the Jurisdiction model"""
        EXPECTED_SUBSET = {"percent_covered": 33, "jurisdiction": "RAIL"}

        client = Client()
        result = client.get(
            "/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7",
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(len(response_object["jurisdictions"]), 2)

        self.assertIn(EXPECTED_SUBSET, response_object["jurisdictions"])

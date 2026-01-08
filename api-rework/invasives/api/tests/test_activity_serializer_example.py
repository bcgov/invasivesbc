from django.test import TestCase
from django.test.client import Client


class ActivitySerializerTest(TestCase):

    fixtures = ["test/test_activities.json"]

    def test_expect_two_activities(self):
        """Verify that two activities are returned from the list endpoint"""
        client = Client()
        result = client.get("/activities")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(len(response_object), 2)

    def test_activity_comment(self):
        """Test that the serialized comment contains the expected string"""
        client = Client()
        result = client.get("/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(response_object["comment"], "The test looks for this comment")

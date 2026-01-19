from django.test import TestCase
from django.test.client import Client
from api.models.activity.activity import Activity
from api.serializers.activity import ActivitySerializer


class TerrestrialMechanicalTreatmentTest(TestCase):

    fixtures = [
        "test/subtypes/treatments/test_terrestrial_mechanical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_mechanical_treatment",
    ]

    def test_expect_two_activities(self):
        """Verify that two activities are returned from the list endpoint"""
        client = Client()
        result = client.get("/activities")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(len(response_object), 2)

    def test_no_pac_number_present(self):
        """Check that participants do not include a pac number when fetched for an Observation activity"""
        try:
            record = Activity.objects.get(id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)

            self.assertIsNotNone(serial.data["subtype_data"]["mechanical_treatments"])
            serial.data["participants"]

            for person in serial.data["participants"]:
                self.assertIsNotNone(person.get("name"))
                self.assertIsNone(person.get("pac_number"))

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def test_casting_fixture_into_serializer(self):
        """fetching an activity can be cast into serializer"""
        try:
            record = Activity.objects.get(id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)
            # Check a subtype specific field
            self.assertIsNotNone(serial.data["subtype_data"]["mechanical_treatments"])

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        client = Client()
        result = client.get("/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        self.assertEqual(
            len(response_object["subtype_data"]["mechanical_treatments"]), 1
        )

        mt = response_object["subtype_data"]["mechanical_treatments"][0]
        self.assertEqual(mt["disposed_material_amount"], 544)
        self.assertEqual(mt["disposed_material_format"], "kg")
        self.assertEqual(mt["disposal_method"], "II")
        self.assertEqual(mt["invasive_plant"], "CT")
        self.assertEqual(mt["mechanical_method"], "DIG")
        self.assertEqual(mt["treated_area_msq"], 33)

    def test_subtype_details_two_entries(self):
        """Subtype keys match the information from fixtures."""
        client = Client()
        result = client.get("/activities/CD542709-F767-402F-818E-117B3FBC797D")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        mt = response_object["subtype_data"]["mechanical_treatments"]
        self.assertEqual(len(mt), 2)

        expected = [
            {
                "disposed_material_amount": 544,
                "disposed_material_format": "m^3",
                "disposal_method": "II",
                "invasive_plant": "JK",
                "mechanical_method": "DIG",
                "treated_area_msq": 33,
            },
            {
                "invasive_plant": "JK",
                "disposed_material_amount": 544,
                "disposed_material_format": "plants",
                "disposal_method": "LDB",
                "mechanical_method": "CNV",
                "treated_area_msq": 512,
            },
        ]
        self.assertCountEqual(mt, expected)

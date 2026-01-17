from django.test import TestCase
from django.test.client import Client
from api.models.activity.activity import Activity
from api.serializers.activity import ActivitySerializer


class ChemicalTreatmentMonitoringTest(TestCase):

    fixtures = [
        "test/subtypes/monitoring/test_chemical_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_chemical_treatment_monitoring",
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
            record = Activity.objects.get(
                activity_id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7"
            )
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)

            self.assertIsNotNone(
                serial.data["subtype_data"]["treatment_monitoring_information"]
            )
            serial.data["participants"]

            for person in serial.data["participants"]:
                self.assertIsNotNone(person.get("name"))
                self.assertIsNone(person.get("pac_number"))

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def test_casting_fixture_into_serializer(self):
        """fetching an activity can be cast into serializer"""
        try:
            record = Activity.objects.get(
                activity_id="CD542709-F767-402F-818E-117B3FBC797D"
            )
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)
            # Check a subtype specific field
            self.assertEqual(
                len(serial.data["subtype_data"]["treatment_monitoring_information"]), 2
            )
        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        client = Client()
        result = client.get("/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        tmi = response_object["subtype_data"]["treatment_monitoring_information"]
        self.assertEqual(len(tmi), 1)
        tmi = tmi[0]
        self.assertEqual(tmi["comment"], "Several plants remain")
        self.assertEqual(tmi["treatment_pass"], "Second")
        self.assertEqual(tmi["invasive_plant"], "JK")
        self.assertEqual(tmi["evidence_of_treatment"], "No")
        self.assertEqual(tmi["management_efficacy_rating"], "6M")

    def test_monitoring_info_keys_serialize_out(self):
        """
        Test the Serialization for Monitoring Info correctly changes the invasive plant code depending on type
        To Pass: One entry must use the invasive_plant_aquatic key, the other uses invasive_plant. Matching semantic of frontend form
        """
        payload = [
            {
                "comment": "Several plants remain",
                "treatment_pass": "Third",
                "invasive_plant_aquatic": "RC",
                "evidence_of_treatment": "Y",
                "management_efficacy_rating": "6M",
                "treatment_efficacy_rating": "1",
                "invasive_plants_on_site": ["ROP", "SWOS"],
            },
            {
                "comment": None,
                "invasive_plant": "CT",
                "evidence_of_treatment": "Y",
                "management_efficacy_rating": "1M",
                "treatment_efficacy_rating": "6",
                "invasive_plants_on_site": [],
                "treatment_pass": "Second",
            },
        ]

        client = Client()
        result = client.get("/activities/CD542709-F767-402F-818E-117B3FBC797D")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        tmi = response_object["subtype_data"]["treatment_monitoring_information"]
        self.assertListEqual(payload, tmi)

    def test_nearest_wells_present(self):
        """Tests Wells tied to a Chemical Monitoring Record are present"""
        client = Client()
        result = client.get("/activities/CD542709-F767-402F-818E-117B3FBC797D")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        nw = response_object["subtype_data"]["nearest_wells"]

        self.assertEqual(len(nw), 3)

        for well in nw:
            self.assertIsNotNone(well["well_tag_number"])
            self.assertIsNotNone(well["distance"])

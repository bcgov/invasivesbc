from django.test import TestCase
from django.test.client import Client
from api.models.activity.activity import Activity
from api.serializers.activity import ActivitySerializer


class AquaticObservationTest(TestCase):
    """
    Tests:
    - Two activities present
    - Activity is Serialized
    - Activity can be correctly serialized from Activity Basic
    - No Pac number on Participants
    """

    fixtures = [
        "test/subtypes/observations/test_aquatic_observation_codes",
        "test/subtypes/observations/test_aquatic_observation",
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
            self.assertEqual(serial.data["subtype_data"]["secchi_depth"], 9)
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
                activity_id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7"
            )
            self.assertIsNotNone(record)

            serial = ActivitySerializer(record)
            # Check a subtype specific field
            self.assertEqual(serial.data["subtype_data"]["secchi_depth"], 9)

        except Activity.DoesNotExist:
            self.fail("Activity does not exist")

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        client = Client()
        result = client.get("/activities/6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        sd = response_object["subtype_data"]

        self.assertEqual(sd["suitable_for_biocontrol"], "No")
        self.assertEqual(sd["pretreatment_observation"], "Yes")

        self.assertGreaterEqual(len(sd["observation_details"]), 1)
        self.assertIn("WET", sd["inflow_permanent"])
        self.assertIn("DISP", sd["inflow_seasonal"])
        self.assertIn("WET", sd["outflow_permanent"])
        self.assertIn("WET", sd["outflow_seasonal"])
        self.assertIn("Dam", sd["waterlevel_management"])
        self.assertIn("AI", sd["waterbody_use"])
        self.assertIn("GR", sd["substrate_type"])
        self.assertIn("H", sd["adjacent_land_use"])

        st = sd["shoreline_types"][0]
        self.assertEqual(st["shoreline_type"], "LGA")
        self.assertEqual(st["percent_covered"], 100)

        od = sd["observation_details"][0]
        self.assertEqual(od["density"], "D")
        self.assertEqual(od["distribution"], "WS")
        self.assertEqual(od["invasive_plant"], "JK")
        self.assertEqual(od["life_stage"], "U")
        self.assertEqual(od["observation_type"], "Positive")
        self.assertEqual(od["sample_point_id"], "123A")

        vs = od["voucher_specimen"]
        self.assertEqual(vs["invasive_plant"], "JK")
        self.assertEqual(vs["voucher_sample_id"], "123Vouch")
        self.assertEqual(vs["date_collected"], "2025-01-21")
        self.assertEqual(vs["date_verified"], "2025-01-22")
        self.assertEqual(vs["herbarium"], "Johns Herbarium")
        self.assertEqual(vs["accession_number"], "123Acc")
        self.assertEqual(vs["completed_by_person"], "Jane Doe")
        self.assertEqual(vs["completed_by_org"], "BC Gov")
        self.assertEqual(vs["utm_zone"], 10)
        self.assertEqual(vs["utm_easting"], 6543232)
        self.assertEqual(vs["utm_northing"], 123456)

    def test_subtype_details_partial(self):
        """Subtype keys match the information from fixtures."""
        client = Client()
        result = client.get("/activities/CD542709-F767-402F-818E-117B3FBC797D")
        self.assertEqual(result.status_code, 200)

        response_object = result.json()
        sd = response_object["subtype_data"]

        self.assertEqual(sd["suitable_for_biocontrol"], "Yes")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertEqual(len(sd["observation_details"]), 2)

        obs_detail = [
            {
                "density": None,
                "distribution": None,
                "invasive_plant": "CT",
                "life_stage": None,
                "observation_type": "Negative",
                "sample_point_id": "567SP",
                "voucher_specimen": None,
            },
            {
                "density": "D",
                "distribution": "WS",
                "invasive_plant": "JK",
                "life_stage": "U",
                "observation_type": "Positive",
                "sample_point_id": "456BD",
                "voucher_specimen": None,
            },
        ]

        self.assertCountEqual(obs_detail, sd["observation_details"])

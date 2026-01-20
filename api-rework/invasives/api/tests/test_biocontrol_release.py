from django.test import TestCase
from django.test.client import Client
from api.models.activity import Activity
from api.serializers.activity import ActivitySerializer


class BiocontrolReleaseTest(TestCase):

  fixtures = [
    "test/subtypes/treatments/test_biocontrol_release_codes",
    "test/subtypes/treatments/test_biocontrol_release",
  ]

  def fetch(self, id):
    client = Client()

    result = client.get(f"/activities/{id}")
    self.assertEqual(result.status_code, 200)
    return result

  def fetch_a(self):
    return self.fetch("6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")

  def fetch_b(self):
    return self.fetch("CD542709-F767-402F-818E-117B3FBC797D")

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

        self.assertIsNotNone(
            serial.data["subtype_data"]["treatment_information"]
        )

        for person in serial.data["participants"]:
            self.assertIsNotNone(person.get("name"))
            self.assertIsNone(person.get("pac_number"))

    except Activity.DoesNotExist:
        self.fail("Activity does not exist")

  def test_casting_fixture_into_serializer(self):
    """fetching an activity can be cast into serializer"""
    try:
      record = Activity.objects.get(id="CD542709-F767-402F-818E-117B3FBC797D")
      self.assertIsNotNone(record)

      serial = ActivitySerializer(record)
      # Check a subtype specific field
      self.assertGreaterEqual(
          len(serial.data["subtype_data"]["treatment_information"]), 1
      )
    except Activity.DoesNotExist:
      self.fail("Activity does not exist")

  def test_subtype_details_full(self):
    """Subtype keys match the information from fixtures."""
    response_object = self.fetch_a().json()

    sd = response_object["subtype_data"]

    ti = sd["treatment_information"]
    self.assertEqual(len(ti), 1)
    ti = ti[0]

    self.assertEqual(ti["agent_source"], "Leafy Greens")
    self.assertEqual(ti["biocontrol_agent"], "HYLEEUP")
    self.assertEqual(ti["collection_date"], "2025-04-30T07:00:00Z")
    self.assertEqual(ti["invasive_plant"], "CT")
    self.assertEqual(ti["linear_segment"], "Yes")
    self.assertEqual(ti["mortality"], 30)
    self.assertEqual(ti["plant_collected_from"], "JK")
    self.assertEqual(ti["plant_collected_from_manual"], None)


    aba = ti["actual_biological_agents"][0]
    self.assertEqual(aba["stage"], "B",)
    self.assertEqual(aba["quantity"], 11)


    eba = ti["estimated_biological_agents"][0]
    self.assertEqual(eba["stage"], "B",)
    self.assertEqual(eba["quantity"], 11)

    tpp = sd["target_plant_phenology"]
    self.assertEqual(tpp["winter_dormant"], 10)
    self.assertEqual(tpp["seedlings"], 11)
    self.assertEqual(tpp["rosettes"], 12)
    self.assertEqual(tpp["bolts"], 13)
    self.assertEqual(tpp["flowering"], 14)
    self.assertEqual(tpp["seeds_forming"], 15)
    self.assertEqual(tpp["senescent"], 25)

    # microsite condition
    self.assertEqual(sd["mesoslope_position"], "LV")
    self.assertEqual(sd["site_surface_shape"], "LN")

    # weather conditions
    self.assertEqual(sd["wind_speed_kmh"], 22)
    self.assertEqual(sd["temperature"], 32)
    self.assertEqual(sd["cloud_cover"], "1")
    self.assertEqual(sd["precipitation"], "DP")
    self.assertEqual(sd["wind_direction"], "NW")

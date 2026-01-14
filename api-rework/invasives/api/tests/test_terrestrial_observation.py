from django.test import TestCase
from django.test.client import Client
from api.models.activity.activity_basic import ActivityBasic
from api.serializers.activity import ActivitySerializer


class TerrestrialObservationTest(TestCase):
  """
    Tests:
    - Two activities present
    - Activity is Serialized
    - Activity can be correctly serialized from Activity Basic
    - No Pac number on Participants
  """

  fixtures = [
    "test/subtypes/observations/test_terrestrial_observation_codes",
    "test/subtypes/observations/test_terrestrial_observation"
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
      record = ActivityBasic.objects.get(activity_id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
      self.assertIsNotNone(record)

      serial = ActivitySerializer(record)
      self.assertEqual(serial.data["subtype_data"]["slope_percent"], "SS")
      serial.data["participants"]

      for person in serial.data["participants"]:
        self.assertIsNotNone(person.get("name"))
        self.assertIsNone(person.get("pac_number"))

    except ActivityBasic.DoesNotExist:
      self.fail("Activity does not exist")

  def test_casting_fixture_into_serializer(self):
    """fetching an activity can be cast into serializer"""
    try:
      record = ActivityBasic.objects.get(activity_id="6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7")
      self.assertIsNotNone(record)

      serial = ActivitySerializer(record)
      self.assertEqual(serial.data["subtype_data"]["slope_percent"], "SS")

    except ActivityBasic.DoesNotExist:
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
    self.assertListEqual(sd["specific_use"], ["NO", "MI"])
    self.assertEqual(sd["research_observation"], "Yes")
    self.assertEqual(sd["visible_well_nearby"], "Unknown")
    self.assertEqual(sd["aspect"], "N")
    self.assertEqual(sd["slope_percent"], "SS")
    self.assertEqual(sd["soil_texture"], "M")
    self.assertEqual(sd["pretreatment_observation"], "Yes")
    self.assertGreaterEqual(len(sd["observation_details"]), 1)

    od = sd["observation_details"][0]
    self.assertEqual(od["density"], "D")
    self.assertEqual(od["distribution"], "WS")
    self.assertEqual(od["invasive_plant"], "JK")
    self.assertEqual(od["life_stage"], "U")
    self.assertEqual(od["observation_type"], "Positive")

    vs = od["voucher_specimen"]
    self.assertEqual(vs["invasive_plant"], "JK")
    self.assertEqual(vs["voucher_sample_id"], "123")
    self.assertEqual(vs["date_collected"], "2025-01-21")
    self.assertEqual(vs["date_verified"], "2025-01-22")
    self.assertEqual(vs["herbarium"], "Johns Herbarium")
    self.assertEqual(vs["accession_number"], "123")
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
      self.assertListEqual(sd["specific_use"], ["GP",])
      self.assertEqual(sd["research_observation"], "Yes")
      self.assertEqual(sd["visible_well_nearby"], "Unknown")
      self.assertEqual(sd["aspect"], "NA")
      self.assertEqual(sd["slope_percent"], "VT")
      self.assertEqual(sd["soil_texture"], "F")
      self.assertEqual(len(sd["observation_details"]), 2)

      obs_detail = [{
        "density": "D",
        "distribution": "WS",
        "invasive_plant": "JK",
        "life_stage": "U",
        "observation_type": "Positive",
        "voucher_specimen": None
      },
      {
        "invasive_plant": "CT",
        "observation_type": "Negative",
        "density": None,
        "voucher_specimen": None,
        "life_stage": None,
        "distribution": None
      }]

      self.assertCountEqual(obs_detail, sd["observation_details"])

from .base import BaseActivitySubtypeTest


class TerrestrialObservationTest(BaseActivitySubtypeTest):
    """
    Tests:
    - Two activities present
    - Activity is Serialized
    - Activity can be correctly serialized from Activity Basic
    - No Pac number on Participants
    """

    fixtures = [
        "test/common/invasive_plant_codes",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(expected_subtype_key="slope_percent")

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
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
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]

        self.assertEqual(sd["suitable_for_biocontrol"], "Yes")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertListEqual(
            sd["specific_use"],
            [
                "GP",
            ],
        )
        self.assertEqual(sd["research_observation"], "Yes")
        self.assertEqual(sd["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["aspect"], "NA")
        self.assertEqual(sd["slope_percent"], "VT")
        self.assertEqual(sd["soil_texture"], "F")
        self.assertEqual(len(sd["observation_details"]), 2)

        obs_detail = [
            {
                "density": "D",
                "distribution": "WS",
                "invasive_plant": "JK",
                "life_stage": "U",
                "observation_type": "Positive",
                "voucher_specimen": None,
            },
            {
                "invasive_plant": "CT",
                "observation_type": "Negative",
                "density": None,
                "voucher_specimen": None,
                "life_stage": None,
                "distribution": None,
            },
        ]

        self.assertCountEqual(obs_detail, sd["observation_details"])

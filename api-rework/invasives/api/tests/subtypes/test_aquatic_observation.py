from .base import BaseActivitySubtypeTest


class AquaticObservationTest(BaseActivitySubtypeTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/observations/test_aquatic_observation_codes",
        "test/subtypes/observations/test_aquatic_observation",
        "test/common/test_participants",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(expected_subtype_key="secchi_depth")

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        # @todo add subtype observation info class
        # self.assertEqual(sd["suitable_for_biocontrol"], "No")
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
        response_object = self.fetch_b().json()

        sd = response_object["subtype_data"]

        # @todo add subtype observation info class
        # self.assertEqual(sd["suitable_for_biocontrol"], "Yes")
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

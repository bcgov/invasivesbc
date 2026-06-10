from .base import BaseActivitySubtypeTest
from api.tests.mock_frontend_submissions import (
    MINIMAL_AQUATIC_OBSERVATION,
    UPDATED_AQUATIC_OBSERVATION,
)


class AquaticObservationTest(BaseActivitySubtypeTest):
    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/common/test_waterlevel_management",
        "test/common/test_waterbody_substrate",
        "test/common/test_waterbody_type",
        "test/subtypes/observations/test_aquatic_observation_codes",
        "test/subtypes/observations/test_aquatic_observation",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        self.assertEqual(sd["context"]["suitable_for_biocontrol"], "No")

        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertGreaterEqual(len(sd["entries"]), 1)
        self.assertIn("Dam", sd["waterlevel_management"])
        self.assertIn("AI", sd["water_use"])
        self.assertIn("Gravel", sd["substrate_type"])
        self.assertIn("H", sd["adjacent_land_use"])

        st = sd["shoreline_types"][0]
        self.assertEqual(st["shoreline_type"], "LGA")
        self.assertEqual(st["percent_covered"], 100)

        od = sd["entries"][0]
        self.assertEqual(od["density"], "D")
        self.assertEqual(od["distribution"], "WS")
        self.assertEqual(od["invasive_plant"], "JK")
        self.assertEqual(od["life_stage"], "U")
        self.assertEqual(od["observation_type"], "Positive")
        self.assertEqual(od["sample_point_id"], "123A")

        vs = od["voucher_specimen"]
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

        wct = sd["waterbody_context"]
        self.assertIn("WET", wct["inflow_permanent"])
        self.assertIn("DISP", wct["inflow_seasonal"])
        self.assertIn("WET", wct["outflow_permanent"])
        self.assertIn("WET", wct["outflow_seasonal"])

    def test_subtype_details_partial(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()

        sd = response_object["subtype_data"]

        self.assertEqual(sd["context"]["suitable_for_biocontrol"], "Yes")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertEqual(len(sd["entries"]), 2)

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

        self.assertCountEqual(obs_detail, sd["entries"])

    def test_submit_record(self):
        """Expect Submitting a record returns 200"""
        self.submit_record(MINIMAL_AQUATIC_OBSERVATION)

    def test_update_record(self):
        """Expect Submitting an updated record returns 200"""
        self.submit_record(UPDATED_AQUATIC_OBSERVATION)

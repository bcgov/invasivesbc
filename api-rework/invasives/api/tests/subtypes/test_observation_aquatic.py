from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
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
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_AQUATIC_OBSERVATION
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Validates that submitting an Aquatic Observation payload:
        1. Correctly handles empty strings in nested entry lists by turning them to null.
        2. Preserves and validates waterbody contexts (inflows/outflows, depths).
        3. Asserts the shape properties dictionary successfully receives the system short_id.
        4. Calculates and maps the calculated Point centroid.
        5. Confirms persistent commits directly down to the DB layout level.
        """
        payload = UPDATED_AQUATIC_OBSERVATION
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        first_entry_out = data["subtype_data"]["entries"][0]
        first_entry_in = payload["subtype_data"]["entries"][0]

        self.assertIsNone(first_entry_out["density"])
        self.assertIsNone(first_entry_out["distribution"])
        self.assertIsNone(first_entry_out["sample_point_id"])
        self.assertIsNone(first_entry_out["voucher_specimen"])
        self.assertEqual(
            first_entry_out["invasive_plant"], first_entry_in["invasive_plant"]
        )

        wb_context_out = data["subtype_data"]["waterbody_context"]
        wb_context_in = payload["subtype_data"]["waterbody_context"]

        self.assertEqual(wb_context_out["type"], wb_context_in["type"])
        self.assertEqual(wb_context_out["max_depth_m"], wb_context_in["max_depth_m"])
        self.assertIsNone(wb_context_out["name_local"])

        self.assertEqual(
            wb_context_out["inflow_permanent"], wb_context_in["inflow_permanent"]
        )
        self.assertEqual(
            wb_context_out["inflow_seasonal"], wb_context_in["inflow_seasonal"]
        )
        self.assertEqual(
            wb_context_out["outflow_permanent"], wb_context_in["outflow_permanent"]
        )
        self.assertEqual(
            wb_context_out["outflow_seasonal"], wb_context_in["outflow_seasonal"]
        )

        subtype_out = data["subtype_data"]
        subtype_in = payload["subtype_data"]

        self.assertEqual(subtype_out["substrate_type"], subtype_in["substrate_type"])
        self.assertEqual(
            len(subtype_out["shoreline_types"]), len(subtype_in["shoreline_types"])
        )
        self.assertEqual(
            subtype_out["shoreline_types"][0]["shoreline_type"],
            subtype_in["shoreline_types"][0]["shoreline_type"],
        )
        self.assertEqual(
            subtype_out["shoreline_types"][0]["percent_covered"],
            subtype_in["shoreline_types"][0]["percent_covered"],
        )

        self.assertIn("centroid", data)
        self.assertEqual(data["centroid"]["type"], "Point")
        self.assertAlmostEqual(
            data["centroid"]["coordinates"][0], payload["longitude"], places=5
        )
        self.assertAlmostEqual(
            data["centroid"]["coordinates"][1], payload["latitude"], places=5
        )

        self.assertEqual(data["shape"]["properties"]["id"], payload["short_id"])

        db_record = Activity.objects.get(id=record_id)
        self.assertEqual(db_record.type, payload["type"])
        self.assertEqual(db_record.subtype, payload["subtype"])
        self.assertEqual(db_record.area_m, payload["area_m"])
        self.assertEqual(db_record.created_by, payload["created_by"])
        self.assertEqual(db_record.form_status, payload["form_status"])
        self.assertEqual(str(db_record.date), payload["date"])

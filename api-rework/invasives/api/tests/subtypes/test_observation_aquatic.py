from .base import BaseActivitySubtypeTest
import copy
from api.models.activity import DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_AQUATIC_OBSERVATION,
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

    def match_updated_subtype_details(self, record_in: dict, record_out: dict):
        # Context
        self.assertEqual(record_out["context"], record_in["context"])

        # Adjacent Land use
        self.assertGreater(len(record_out["adjacent_land_use"]), 0)
        self.assertEqual(
            record_out["adjacent_land_use"], record_in["adjacent_land_use"]
        )

        # Shoreline Types
        self.assertGreater(len(record_out["shoreline_types"]), 0)
        self.assertEqual(record_out["shoreline_types"], record_in["shoreline_types"])

        # Entries section
        self.assertGreater(len(record_out["entries"]), 0, "Entries were not created")
        entry_in = record_in["entries"][0]
        entry_out = record_out["entries"][0]
        self.assertEqual(entry_in["invasive_plant"], entry_out["invasive_plant"])
        self.assertEqual(entry_in["observation_type"], entry_out["observation_type"])

        # Waterbody Context Section
        wb_out = record_out["waterbody_context"]
        wb_in = record_in["waterbody_context"]

        self.assertGreater(len(wb_out["inflow_permanent"]), 0)
        self.assertEqual(wb_out["inflow_permanent"], wb_in["inflow_permanent"])

        self.assertGreater(len(wb_out["inflow_seasonal"]), 0)
        self.assertEqual(wb_out["inflow_seasonal"], wb_in["inflow_seasonal"])

        self.assertGreater(len(wb_out["outflow_permanent"]), 0)
        self.assertEqual(wb_out["outflow_permanent"], wb_in["outflow_permanent"])

        self.assertGreater(len(wb_out["outflow_seasonal"]), 0)
        self.assertEqual(wb_out["outflow_seasonal"], wb_in["outflow_seasonal"])

        self.assertEqual(wb_out["max_depth_m"], wb_in["max_depth_m"])
        self.assertEqual(wb_out["access"], wb_in["access"])
        self.assertEqual(wb_out["colour"], wb_in["colour"])
        self.assertEqual(wb_out["comment"], wb_in["comment"])
        self.assertEqual(wb_out["name_gazetted"], wb_in["name_gazetted"])
        self.assertEqual(wb_out["secchi_depth"], wb_in["secchi_depth"])
        self.assertEqual(wb_out["type"], wb_in["type"])

    def test_initial_draft_submissions(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """

        payload = EMPTY_AQUATIC_OBSERVATION

        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record_exists = DraftActivity.objects.filter(pk=payload["id"]).exists()
        self.assertTrue(record_exists, "Record failed to be created")

    def test_update_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is updated in DB
        """
        payload = copy.deepcopy(UPDATED_AQUATIC_OBSERVATION)
        payload["form_status"] = "Draft"

        # Submit Draft
        res = self.draft_record(MINIMAL_AQUATIC_OBSERVATION)

        # Update Draft
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        # Check update didn't delete DraftActivity
        record_exists = DraftActivity.objects.filter(id=payload["id"]).exists()
        self.assertTrue(record_exists, "Record no longer exists in DB after update")

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
        )
        self.match_common_fields(
            record_in=payload,
            record_out=record,
        )

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_AQUATIC_OBSERVATION
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()
        self.assertEqual(record["form_status"], "Submitted")
        self.assertIsNotNone(record)

    def test_update_record(self):
        payload = UPDATED_AQUATIC_OBSERVATION

        # Create Initial
        self.submit_record(MINIMAL_AQUATIC_OBSERVATION)

        # Update Record
        response = self.submit_record(payload)
        record = response.json()

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
        )
        self.match_common_fields(
            record_in=payload,
            record_out=record,
        )

    def test_draft_record_was_removed_by_submit(self):
        payload = MINIMAL_AQUATIC_OBSERVATION
        self.draft_record_was_removed_by_submit(payload)

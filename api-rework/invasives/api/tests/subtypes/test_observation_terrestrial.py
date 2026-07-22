import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_TERRESTRIAL_OBSERVATION,
    MINIMAL_TERRESTRIAL_OBSERVATION,
    UPDATED_TERRESTRIAL_OBSERVATION,
)


class TerrestrialObservationTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_invasive_plant_codes",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_employer",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        sd = response_object["subtype_data"]

        self.assertEqual(
            sd["context"]["suitable_for_biocontrol_agent"],
            "Yes",
        )
        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "NO")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "N")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "SS")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "M")

        self.assertGreaterEqual(len(sd["entries"]), 1)

        od = sd["entries"][0]
        self.assertEqual(od["density"], "D")
        self.assertEqual(od["distribution"], "WS")
        self.assertEqual(od["invasive_plant"], "JK")
        self.assertEqual(od["life_stage"], "U")
        self.assertEqual(od["observation_type"], "Positive")

        vs = od["voucher_specimen"]
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

        self.assertEqual(sd["context"]["suitable_for_biocontrol_agent"], "No")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "GP")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "NA")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "VT")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "F")
        self.assertEqual(len(sd["entries"]), 2)

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

        self.assertCountEqual(obs_detail, sd["entries"])

    def match_updated_subtype_details(self, record_in: dict, record_out: dict):
        """
        Note:
            - Based on the UPDATED_ payload data.
        Expect:
            - All incoming data to match outputted data
            - '' Fields to come back as None type
        """
        self.assertGreater(
            len(record_out["entries"]),
            0,
            "No entries were created for record.",
        )

        # Entries Section
        ## Negative Entry
        entries_in = record_in["entries"][0]
        entries_out = record_out["entries"][0]

        self.assertEqual(
            entries_in["observation_type"], entries_out["observation_type"]
        )
        self.assertEqual(entries_in["invasive_plant"], entries_out["invasive_plant"])
        self.assertIsNone(entries_out["life_stage"])
        self.assertIsNone(entries_out["distribution"])
        self.assertIsNone(entries_out["density"])

        ## Positive Entry
        entries_in = record_in["entries"][1]
        entries_out = record_out["entries"][1]

        self.assertEqual(entries_in["density"], entries_out["density"])
        self.assertEqual(entries_in["distribution"], entries_out["distribution"])
        self.assertEqual(entries_in["invasive_plant"], entries_out["invasive_plant"])
        self.assertEqual(entries_in["life_stage"], entries_out["life_stage"])
        self.assertEqual(
            entries_in["observation_type"], entries_out["observation_type"]
        )

        # Voucher Section
        voucher_in = entries_in["voucher_specimen"]
        voucher_out = entries_out["voucher_specimen"]

        self.assertEqual(
            voucher_in["voucher_sample_id"], voucher_out["voucher_sample_id"]
        )
        self.assertEqual(voucher_in["herbarium"], voucher_out["herbarium"])
        self.assertEqual(
            voucher_in["accession_number"], voucher_out["accession_number"]
        )
        self.assertEqual(voucher_in["date_collected"], voucher_out["date_collected"])
        self.assertEqual(voucher_in["date_verified"], voucher_out["date_verified"])
        self.assertEqual(
            voucher_in["completed_by_person"], voucher_out["completed_by_person"]
        )
        self.assertEqual(
            voucher_in["completed_by_org"], voucher_out["completed_by_org"]
        )
        self.assertEqual(voucher_in["utm_zone"], voucher_out["utm_zone"])
        self.assertEqual(voucher_in["utm_easting"], voucher_out["utm_easting"])
        self.assertEqual(voucher_in["utm_northing"], voucher_out["utm_northing"])

        # Context Section
        context_in = record_in["context"]
        context_out = record_out["context"]

        self.assertEqual(
            context_in["research_observation"], context_out["research_observation"]
        )
        self.assertEqual(
            context_in["visible_well_nearby"], context_out["visible_well_nearby"]
        )
        self.assertEqual(context_in["aspect"], context_out["aspect"]["code"])
        self.assertEqual(
            context_in["slope_percent"], context_out["slope_percent"]["code"]
        )
        self.assertEqual(
            context_in["soil_texture"], context_out["soil_texture"]["code"]
        )
        self.assertEqual(
            context_in["suitable_for_biocontrol_agent"],
            context_out["suitable_for_biocontrol_agent"],
        )

        self.assertGreater(
            len(context_in["specific_uses"]), 0, "Specific Uses did not populate"
        )
        self.assertEqual(context_in["specific_uses"], context_out["specific_uses"])

    def test_initial_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """
        payload = EMPTY_TERRESTRIAL_OBSERVATION

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
        payload = copy.deepcopy(UPDATED_TERRESTRIAL_OBSERVATION)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_TERRESTRIAL_OBSERVATION)

        # Update Draft Record
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        # Update didn't delete DraftActivity,
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
        payload = MINIMAL_TERRESTRIAL_OBSERVATION
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Expect:
            - Re-submitting a record updates existing fields.
        """
        payload = UPDATED_TERRESTRIAL_OBSERVATION

        # Set Initial Submission
        self.submit_record(MINIMAL_TERRESTRIAL_OBSERVATION)
        # Submit Updated Record
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
        payload = MINIMAL_TERRESTRIAL_OBSERVATION
        self.draft_record_was_removed_by_submit(payload)

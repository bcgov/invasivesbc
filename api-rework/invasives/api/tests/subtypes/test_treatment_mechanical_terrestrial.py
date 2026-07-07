import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_MECH_TREATMENT_TERRESTRIAL,
    MINIMAL_MECH_TREATMENT_TERRESTRIAL,
    UPDATED_MECH_TREATMENT_TERRESTRIAL,
)


class TerrestrialMechanicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_mechanical_treatment",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        self.assertEqual(len(response_object["subtype_data"]["entries"]), 1)

        mt = response_object["subtype_data"]["entries"][0]
        self.assertEqual(mt["disposed_material_amount"], 544)
        self.assertEqual(mt["disposed_material_format"], "kg")
        self.assertEqual(mt["disposal_method"], "II")
        self.assertEqual(mt["invasive_plant"], "CT")
        self.assertEqual(mt["mechanical_method"], "DIG")
        self.assertEqual(mt["treated_area_msq"], 33)

    def test_subtype_details_two_entries(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        mt = response_object["subtype_data"]["entries"]
        self.assertEqual(len(mt), 2)

        expected = [
            {
                "disposed_material_amount": 544,
                "disposed_material_format": "m^3",
                "disposal_method": "II",
                "invasive_plant": "JK",
                "mechanical_method": "DIG",
                "treated_area_msq": 33,
            },
            {
                "invasive_plant": "JK",
                "disposed_material_amount": 544,
                "disposed_material_format": "plants",
                "disposal_method": "LDB",
                "mechanical_method": "CNV",
                "treated_area_msq": 512,
            },
        ]
        self.assertCountEqual(mt, expected)

    def match_updated_subtype_details(self, record_in: dict, record_out: dict):
        # Entries
        entry_in = record_in["entries"][0]
        entry_out = record_out["entries"][0]

        self.assertGreater(
            len(record_out["entries"]), 0, "Entries were not created for record"
        )
        self.assertEqual(entry_in["disposal_method"], entry_out["disposal_method"])
        self.assertEqual(entry_in["invasive_plant"], entry_out["invasive_plant"])
        self.assertEqual(entry_in["mechanical_method"], entry_out["mechanical_method"])
        self.assertEqual(entry_in["treated_area_msq"], entry_out["treated_area_msq"])
        self.assertEqual(
            entry_in["disposed_material_amount"], entry_out["disposed_material_amount"]
        )
        self.assertEqual(
            entry_in["disposed_material_format"], entry_out["disposed_material_format"]
        )

    def test_initial_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """
        payload = EMPTY_MECH_TREATMENT_TERRESTRIAL

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
        payload = copy.deepcopy(UPDATED_MECH_TREATMENT_TERRESTRIAL)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_MECH_TREATMENT_TERRESTRIAL)

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

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_MECH_TREATMENT_TERRESTRIAL
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Expect:
            - Re-submitting a record updates existing fields.
        """
        payload = UPDATED_MECH_TREATMENT_TERRESTRIAL

        # Set Initial Submission
        self.submit_record(MINIMAL_MECH_TREATMENT_TERRESTRIAL)

        # Submit Updated Record
        response = self.submit_record(payload)
        record = response.json()

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"], record_out=record["subtype_data"]
        )

    def test_draft_record_was_removed_by_submit(self):
        payload = MINIMAL_MECH_TREATMENT_TERRESTRIAL
        self.draft_record_was_removed_by_submit(payload)

import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_CHEM_TREATMENT_TERRESTRIAL,
    MINIMAL_CHEM_TREATMENT_TERRESTRIAL,
    UPDATED_CHEM_TREATMENT_TERRESTRIAL,
)


class TerrestrialChemicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_invasive_plant_codes",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_employer",
        "test/common/test_wind_codes",
        "test/common/test_nearest_wells",
        "test/common/test_chemical_treatments_codes",
        "test/subtypes/treatments/test_chemical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_chemical_treatment",
        "test/common/test_participants",
    ]

    def test_subtype_values(self):
        record = self.fetch_a().json()
        sd = record["subtype_data"]
        self.assertIsNotNone(sd)

        self.assertEqual(sd["context"]["pesticide_use_permit"], "none")
        self.assertEqual(sd["context"]["pest_management_plan"], "BCGOV")
        self.assertEqual(sd["context"]["temperature_c"], 23)
        self.assertEqual(sd["context"]["wind_speed_kmh"], 33)
        self.assertEqual(sd["context"]["application_start_time"], "2025-01-01T00:00")
        self.assertEqual(sd["context"]["wind_direction"], "NW")
        self.assertEqual(sd["context"]["humidity"], 30)
        self.assertEqual(sd["context"]["treatment_notice_signs"], "Yes")
        self.assertEqual(sd["context"]["precautionary_statement"], "COM")
        self.assertEqual(sd["context"]["ntz_reduction"], True)
        self.assertEqual(
            sd["context"]["rationale_for_ntz_reduction"], "stated rationale"
        )
        self.assertEqual(sd["context"]["additional_unmapped_well_water"], True)
        self.assertEqual(sd["context"]["pest_injury_threshold_determination"], True)

        wells = sd["well_entries"]
        self.assertEqual(len(wells), 3)

        for well in wells:
            self.assertIsNotNone(well["well_tag"])
            self.assertIsNotNone(well["distance"])

    def match_updated_subtype_details(self, record_in: dict, record_out: dict):
        """
        Note:
            - Based on the UPDATED_ payload data.
        Expect:
            - All incoming data to match outputted data
            - '' Fields to come back as None type
        """

        # Form Context
        form_context_in = record_in["context"]
        form_context_out = record_out["context"]

        self.assertIsNone(form_context_out["rationale_for_ntz_reduction"])
        self.assertIsNone(form_context_out["pest_management_plan_manual"])

        self.assertEqual(
            form_context_in["humidity"],
            form_context_out["humidity"],
        )
        self.assertEqual(
            form_context_in["pesticide_employer_code"],
            form_context_out["pesticide_employer_code"],
        )
        self.assertIsNone(form_context_out["pesticide_use_permit"])
        self.assertEqual(
            form_context_in["pest_management_plan"],
            form_context_out["pest_management_plan"],
        )

        self.assertEqual(
            form_context_in["temperature_c"],
            form_context_out["temperature_c"],
        )
        self.assertEqual(
            form_context_in["wind_speed_kmh"],
            form_context_out["wind_speed_kmh"],
        )
        self.assertEqual(
            form_context_in["application_start_time"],
            form_context_out["application_start_time"],
        )
        self.assertEqual(
            form_context_in["wind_direction"],
            form_context_out["wind_direction"],
        )

        self.assertEqual(
            form_context_in["treatment_notice_signs"],
            form_context_out["treatment_notice_signs"],
        )
        self.assertEqual(
            form_context_in["precautionary_statement"],
            form_context_out["precautionary_statement"],
        )
        self.assertEqual(
            form_context_in["ntz_reduction"],
            form_context_out["ntz_reduction"],
        )

        self.assertEqual(
            form_context_in["additional_unmapped_well_water"],
            form_context_out["additional_unmapped_well_water"],
        )
        self.assertEqual(
            form_context_in["pest_injury_threshold_determination"],
            form_context_out["pest_injury_threshold_determination"],
        )

        # Treatment Details
        treatment_context_in = record_in["treatment_context"]
        treatment_context_out = record_out["treatment_context"]

        self.assertEqual(
            treatment_context_in["tank_mix"],
            treatment_context_out["tank_mix"],
        )
        self.assertEqual(
            treatment_context_in["application_method"],
            treatment_context_out["application_method"],
        )
        self.assertEqual(
            treatment_context_in["calculation_type"],
            treatment_context_out["calculation_type"],
        )
        self.assertEqual(
            treatment_context_in["amount_mix_used_l"],
            treatment_context_out["amount_mix_used_l"],
        )
        self.assertEqual(
            treatment_context_in["delivery_rate"],
            treatment_context_out["delivery_rate"],
        )
        self.assertCountEqual(
            treatment_context_in["herbicide"],
            treatment_context_out["herbicide"],
        )
        self.assertCountEqual(
            treatment_context_in["plants_treated"],
            treatment_context_out["plants_treated"],
        )

    def test_initial_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """
        payload = EMPTY_CHEM_TREATMENT_TERRESTRIAL

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
        payload = copy.deepcopy(UPDATED_CHEM_TREATMENT_TERRESTRIAL)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_CHEM_TREATMENT_TERRESTRIAL)

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
        payload = MINIMAL_CHEM_TREATMENT_TERRESTRIAL
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()
        self.assertEqual(record["form_status"], "Submitted")
        self.assertIsNotNone(record)

    def test_update_record(self):
        payload = UPDATED_CHEM_TREATMENT_TERRESTRIAL

        # Create Initial
        self.submit_record(MINIMAL_CHEM_TREATMENT_TERRESTRIAL)

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
        payload = MINIMAL_CHEM_TREATMENT_TERRESTRIAL
        self.draft_record_was_removed_by_submit(payload)

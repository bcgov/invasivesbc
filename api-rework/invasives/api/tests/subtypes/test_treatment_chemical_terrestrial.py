from .base import BaseActivitySubtypeTest
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

    def test_draft_submissions(self):
        self.draft_pydantic_protocol_test(
            empty_record=EMPTY_CHEM_TREATMENT_TERRESTRIAL,
            minimal_record=MINIMAL_CHEM_TREATMENT_TERRESTRIAL,
            full_record=UPDATED_CHEM_TREATMENT_TERRESTRIAL,
        )

    def test_submit_record(self):
        """Expect Submitting a record returns 200"""
        self.submit_record(MINIMAL_CHEM_TREATMENT_TERRESTRIAL)

    def test_update_record(self):
        """Expect Submitting an updated record returns 200"""
        self.submit_record(UPDATED_CHEM_TREATMENT_TERRESTRIAL)

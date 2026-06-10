from .base import BaseActivitySubtypeTest
from api.tests.mock_frontend_submissions import (
    MINIMAL_CHEM_TREATMENT_MONITORING,
    UPDATED_CHEM_TREATMENT_MONITORING,
)


class ChemicalTreatmentMonitoringTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/monitoring/test_chem_mech_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_chemical_treatment_monitoring",
        "test/common/test_nearest_wells",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""

        response_object = self.fetch_a().json()
        tmi = response_object["subtype_data"]["entries"]
        self.assertEqual(len(tmi), 1)
        tmi = tmi[0]
        self.assertEqual(tmi["comment"], "Several plants remain")
        self.assertEqual(tmi["treatment_pass"], "Second")
        self.assertEqual(tmi["invasive_plant"], "JK")
        self.assertEqual(tmi["evidence_of_treatment"], "No")
        self.assertEqual(tmi["management_efficacy_rating"], "6M")

    def test_nearest_wells_present(self):
        """Tests Wells tied to a Chemical Monitoring Record are present"""

        response_object = self.fetch_b().json()
        nw = response_object["subtype_data"]["well_entries"]

        self.assertEqual(len(nw), 3)

        for well in nw:
            self.assertIsNotNone(well["well_tag"])
            self.assertIsNotNone(well["distance"])

    def test_submit_record(self):
        """Expect Submitting a record returns 200"""
        self.submit_record(MINIMAL_CHEM_TREATMENT_MONITORING)

    def test_update_record(self):
        """Expect Submitting an updated record returns 200"""
        self.submit_record(UPDATED_CHEM_TREATMENT_MONITORING)

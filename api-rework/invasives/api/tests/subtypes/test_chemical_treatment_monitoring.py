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

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
            - Fetching record matches result returned by API
        """
        create_return = self.submit_record(MINIMAL_CHEM_TREATMENT_MONITORING).json()
        fetch_return = self.fetch(id=MINIMAL_CHEM_TREATMENT_MONITORING["id"]).json()

        self.assertEqual(
            create_return,
            fetch_return,
            "Serialized response from API did not match expected result from fetch request.",
        )

    def test_update_record(self):
        """
        Expect:
            - Submitting an updated record returns 200
            - Existing record is updated
            - Fetching record matches results.
        """
        update_return = self.submit_record(UPDATED_CHEM_TREATMENT_MONITORING).json()
        fetch_return = self.fetch(id=UPDATED_CHEM_TREATMENT_MONITORING["id"]).json()

        self.assertEqual(
            update_return,
            fetch_return,
            "Serialized response from API did not match expected result from fetch request.",
        )

from .base import BaseActivitySubtypeTest


class MechanicalTreatmentMonitoringTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/monitoring/test_chem_mech_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_mechanical_treatment_monitoring",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        tmi = response_object["subtype_data"]["terrestrial_entries"]
        self.assertEqual(len(tmi), 1)
        tmi = tmi[0]
        self.assertEqual(tmi["comment"], "Several plants remain")
        self.assertEqual(tmi["treatment_pass"], "Second")
        self.assertEqual(tmi["invasive_plant"], "JK")
        self.assertEqual(tmi["evidence_of_treatment"], "No")
        self.assertEqual(tmi["management_efficacy_rating"], "6M")

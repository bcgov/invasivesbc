from .base import BaseActivitySubtypeTest


class ChemicalTreatmentMonitoringTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/monitoring/test_chemical_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_chemical_treatment_monitoring",
        "test/common/test_nearest_wells",
        "test/common/test_participants",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(
            expected_subtype_key="treatment_monitoring_information"
        )

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""

        response_object = self.fetch_a().json()
        tmi = response_object["subtype_data"]["treatment_monitoring_information"]
        self.assertEqual(len(tmi), 1)
        tmi = tmi[0]
        self.assertEqual(tmi["comment"], "Several plants remain")
        self.assertEqual(tmi["treatment_pass"], "Second")
        self.assertEqual(tmi["invasive_plant"], "JK")
        self.assertEqual(tmi["evidence_of_treatment"], "No")
        self.assertEqual(tmi["management_efficacy_rating"], "6M")

    def test_monitoring_info_keys_serialize_out(self):
        """
        Test the Serialization for Monitoring Info correctly changes the invasive plant code depending on type
        To Pass: One entry must use the invasive_plant_aquatic key, the other uses invasive_plant. Matching semantic of frontend form
        """
        payload = [
            {
                "comment": "Several plants remain",
                "treatment_pass": "Third",
                "invasive_plant_aquatic": "RC",
                "evidence_of_treatment": "Y",
                "management_efficacy_rating": "6M",
                "treatment_efficacy_rating": "1",
                "invasive_plants_on_site": ["ROP", "SWOS"],
            },
            {
                "comment": None,
                "invasive_plant": "CT",
                "evidence_of_treatment": "Y",
                "management_efficacy_rating": "1M",
                "treatment_efficacy_rating": "6",
                "invasive_plants_on_site": [],
                "treatment_pass": "Second",
            },
        ]

        response_object = self.fetch_b().json()
        tmi = response_object["subtype_data"]["treatment_monitoring_information"]
        self.assertListEqual(payload, tmi)

    def test_nearest_wells_present(self):
        """Tests Wells tied to a Chemical Monitoring Record are present"""

        response_object = self.fetch_b().json()
        nw = response_object["subtype_data"]["nearest_wells"]

        self.assertEqual(len(nw), 3)

        for well in nw:
            self.assertIsNotNone(well["well_tag_number"])
            self.assertIsNotNone(well["distance"])

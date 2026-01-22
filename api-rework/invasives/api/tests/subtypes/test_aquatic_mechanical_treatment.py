from .base import BaseActivitySubtypeTest


class AquaticMechanicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_aquatic_mechanical_treatment",
        "test/common/test_participants",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(
            expected_subtype_key="mechanical_treatments"
        )

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        self.assertEqual(
            len(response_object["subtype_data"]["mechanical_treatments"]), 1
        )

        sd = response_object["subtype_data"]
        mt = sd["mechanical_treatments"][0]

        self.assertEqual(mt["disposed_material_amount"], 544)
        self.assertEqual(mt["disposed_material_format"], "kg")
        self.assertEqual(mt["disposal_method"], "II")
        self.assertEqual(mt["invasive_plant"], "CT")
        self.assertEqual(mt["mechanical_method"], "DIG")
        self.assertEqual(mt["treated_area_msq"], 33)

        self.assertEqual(len(sd["shoreline_types"]), 1)
        st = sd["shoreline_types"][0]

        self.assertEqual(st["percent_covered"], 100)
        self.assertEqual(st["shoreline_type"], "RR")

        self.assertEqual(sd["authorization_info"], "The test looks for this")

    def test_subtype_details_two_entries(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]
        self.assertEqual(sd["authorization_info"], "The test looks for this")

        mt = sd["mechanical_treatments"]
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

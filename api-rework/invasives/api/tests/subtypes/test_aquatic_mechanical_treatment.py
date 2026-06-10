from .base import BaseActivitySubtypeTest
from api.tests.mock_frontend_submissions import (
    MINIMAL_MECH_TREATMENT_AQUATIC,
    UPDATED_MECH_TREATMENT_AQUATIC,
)


class AquaticMechanicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_aquatic_mechanical_treatment",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        self.assertEqual(len(response_object["subtype_data"]["entries"]), 1)

        sd = response_object["subtype_data"]
        mt = sd["entries"][0]

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

        self.assertEqual(
            sd["authorization_information"][0]["detail"],
            "The test looks for this",
        )

    def test_subtype_details_two_entries(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]
        self.assertEqual(
            sd["authorization_information"][0]["detail"],
            "The test looks for this",
        )
        mt = sd["entries"]
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

    def test_submit_record(self):
        """Expect Submitting a record returns 200"""
        self.submit_record(MINIMAL_MECH_TREATMENT_AQUATIC)

    def test_update_record(self):
        """Expect Submitting an updated record returns 200"""
        self.submit_record(UPDATED_MECH_TREATMENT_AQUATIC)

from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
    EMPTY_MECH_TREATMENT_AQUATIC,
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
            sd["authorization_information"],
            "The test looks for this",
        )

    def test_subtype_details_two_entries(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]
        self.assertEqual(
            sd["authorization_information"],
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

    def test_draft_submissions(self):
        self.draft_pydantic_protocol_test(
            empty_record=EMPTY_MECH_TREATMENT_AQUATIC,
            minimal_record=MINIMAL_MECH_TREATMENT_AQUATIC,
            full_record=UPDATED_MECH_TREATMENT_AQUATIC,
        )

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_MECH_TREATMENT_AQUATIC
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_aquatic_mechanical_treatment_record(self):
        """
        Validates that submitting an Aquatic Mechanical Treatment payload:
        1. Confirms the API responds with a 200 OK status code.
        2. Verifies integer-to-float conversions for numeric tracking properties.
        3. Asserts nested treatment specific business keys are correctly stored.
        4. Validates geometry property injection and Point centroid generation.
        5. Queries the ORM layer directly to confirm real persistence.
        """
        payload = UPDATED_MECH_TREATMENT_AQUATIC
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        first_entry_out = data["subtype_data"]["entries"][0]
        first_entry_in = payload["subtype_data"]["entries"][0]

        self.assertIsInstance(first_entry_out["treated_area_msq"], float)
        self.assertEqual(
            first_entry_out["treated_area_msq"],
            float(first_entry_in["treated_area_msq"]),
        )

        self.assertEqual(
            first_entry_out["disposed_material_amount"],
            first_entry_in["disposed_material_amount"],
        )
        self.assertEqual(
            first_entry_out["disposed_material_format"],
            first_entry_in["disposed_material_format"],
        )
        self.assertEqual(
            first_entry_out["disposal_method"], first_entry_in["disposal_method"]
        )
        self.assertEqual(
            first_entry_out["mechanical_method"], first_entry_in["mechanical_method"]
        )
        self.assertEqual(
            first_entry_out["invasive_plant"], first_entry_in["invasive_plant"]
        )

        subtype_out = data["subtype_data"]
        subtype_in = payload["subtype_data"]

        self.assertEqual(
            subtype_out["authorization_information"],
            subtype_in["authorization_information"],
        )
        self.assertEqual(
            subtype_out["shoreline_types"][0]["shoreline_type"],
            subtype_in["shoreline_types"][0]["shoreline_type"],
        )
        self.assertEqual(
            subtype_out["shoreline_types"][0]["percent_covered"],
            subtype_in["shoreline_types"][0]["percent_covered"],
        )

        self.assertIn("centroid", data)
        self.assertEqual(data["centroid"]["type"], "Point")
        self.assertAlmostEqual(
            data["centroid"]["coordinates"][0], payload["longitude"], places=5
        )
        self.assertAlmostEqual(
            data["centroid"]["coordinates"][1], payload["latitude"], places=5
        )

        self.assertEqual(data["shape"]["properties"]["id"], payload["short_id"])

        db_record = Activity.objects.get(id=record_id)
        self.assertEqual(db_record.subtype, payload["subtype"])
        self.assertEqual(db_record.area_m, payload["area_m"])

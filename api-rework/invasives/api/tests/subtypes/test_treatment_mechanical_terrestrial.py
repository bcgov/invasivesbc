from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
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
        Validates that submitting a Terrestrial Mechanical Treatment payload:
        1. Responds with an HTTP 200 OK status code.
        2. Asserts correct data coercion of area metrics from integers to floats.
        3. Validates terrestrial treatment execution values (disposal format, method).
        4. Verifies geographic polygon properties injection and centroid processing.
        5. Performs a deep integrity validation against the actual database instance.
        """
        payload = UPDATED_MECH_TREATMENT_TERRESTRIAL
        record_id = payload["id"]

        response = self.submit_record(payload)
        self.assertEqual(response.status_code, 200)
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

        self.assertEqual(db_record.type, payload["type"])
        self.assertEqual(db_record.subtype, payload["subtype"])
        self.assertEqual(db_record.form_status, payload["form_status"])
        self.assertEqual(db_record.area_m, payload["area_m"])
        self.assertEqual(db_record.created_by, payload["created_by"])
        self.assertEqual(str(db_record.date), payload["date"])

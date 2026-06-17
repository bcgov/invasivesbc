from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
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
        """
        payload = MINIMAL_CHEM_TREATMENT_MONITORING
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Validates a Chemical Plant Monitoring activity record by mapping
        assertions dynamically against the input payload fields, utilizing
        raw integer status codes, and inspecting core Activity model columns.
        """

        payload = UPDATED_CHEM_TREATMENT_MONITORING
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        entries_in = payload["subtype_data"]["entries"]
        entries_out = data["subtype_data"]["entries"]
        self.assertEqual(len(entries_out), len(entries_in))

        self.assertEqual(
            entries_out[0]["invasive_plant"], entries_in[0]["invasive_plant"]
        )
        self.assertEqual(
            entries_out[0]["treatment_pass"], entries_in[0]["treatment_pass"]
        )
        self.assertEqual(
            entries_out[0]["treatment_efficacy_rating"],
            entries_in[0]["treatment_efficacy_rating"],
        )
        self.assertNotIn("invasive_plant_aquatic", entries_out[0])

        self.assertEqual(
            entries_out[1]["invasive_plant_aquatic"],
            entries_in[1]["invasive_plant_aquatic"],
        )
        self.assertEqual(
            entries_out[1]["treatment_pass"], entries_in[1]["treatment_pass"]
        )
        self.assertEqual(
            entries_out[1]["treatment_efficacy_rating"],
            entries_in[1]["treatment_efficacy_rating"],
        )
        self.assertNotIn("invasive_plant", entries_out[1])

        self.assertEqual(data["subtype_data"]["well_entries"], [])

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
        self.assertEqual(db_record.form_status, payload["form_status"])
        self.assertEqual(db_record.comment, payload["comment"])
        self.assertEqual(db_record.created_by, payload["created_by"])
        self.assertEqual(str(db_record.date), payload["date"])

from .base import BaseActivitySubtypeTest
from api.models.activity import Activity, DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_TERRESTRIAL_OBSERVATION,
    MINIMAL_TERRESTRIAL_OBSERVATION,
    UPDATED_TERRESTRIAL_OBSERVATION,
)


class TerrestrialObservationTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        sd = response_object["subtype_data"]

        self.assertEqual(
            sd["context"]["suitable_for_biocontrol_agent"],
            "Yes",
        )
        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "NO")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "N")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "SS")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "M")
        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertGreaterEqual(len(sd["entries"]), 1)

        od = sd["entries"][0]
        self.assertEqual(od["density"], "D")
        self.assertEqual(od["distribution"], "WS")
        self.assertEqual(od["invasive_plant"], "JK")
        self.assertEqual(od["life_stage"], "U")
        self.assertEqual(od["observation_type"], "Positive")

        vs = od["voucher_specimen"]
        self.assertEqual(vs["voucher_sample_id"], "123")
        self.assertEqual(vs["date_collected"], "2025-01-21")
        self.assertEqual(vs["date_verified"], "2025-01-22")
        self.assertEqual(vs["herbarium"], "Johns Herbarium")
        self.assertEqual(vs["accession_number"], "123")
        self.assertEqual(vs["completed_by_person"], "Jane Doe")
        self.assertEqual(vs["completed_by_org"], "BC Gov")
        self.assertEqual(vs["utm_zone"], 10)
        self.assertEqual(vs["utm_easting"], 6543232)
        self.assertEqual(vs["utm_northing"], 123456)

    def test_subtype_details_partial(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]

        self.assertEqual(sd["context"]["suitable_for_biocontrol_agent"], "No")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "GP")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "NA")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "VT")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "F")
        self.assertEqual(len(sd["entries"]), 2)

        obs_detail = [
            {
                "density": "D",
                "distribution": "WS",
                "invasive_plant": "JK",
                "life_stage": "U",
                "observation_type": "Positive",
                "voucher_specimen": None,
            },
            {
                "invasive_plant": "CT",
                "observation_type": "Negative",
                "density": None,
                "voucher_specimen": None,
                "life_stage": None,
                "distribution": None,
            },
        ]

        self.assertCountEqual(obs_detail, sd["entries"])

    def test_initial_draft_submissions(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """
        payload = EMPTY_TERRESTRIAL_OBSERVATION
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        self.assertEqual(record["id"], payload["id"])
        self.assertEqual(record["short_id"], payload["short_id"])
        # Needs Serializers before can expand tests.
        # self.assertGreater(len(record["subtype_data"]["entries"]), 0)
        # self.assertEqual(
        #     record["subtype_data"]["entries"][0]["observation_type"],
        #     payload["subtype_data"]["entries"][0]["observation_type"],
        # )

    def test_update_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is updated in DB
        """
        payload = MINIMAL_TERRESTRIAL_OBSERVATION
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        self.assertEqual(record["id"], payload["id"])
        self.assertEqual(record["short_id"], payload["short_id"])
        self.assertEqual(record["form_status"], payload["form_status"])
        rec = DraftActivity.objects.get(id=payload["id"])
        self.assertIsNotNone(rec)
        # Needs Serializers before can expand tests.
        # self.assertEqual(len(record["subtype_data"]["entries"]), 1)
        # self.assertEqual(
        #     record["subtype_data"]["entries"][0]["observation_type"],
        #     payload["subtype_data"]["entries"][0]["observation_type"],
        # )

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
            - Draft Record is deleted when submitted record instantiated
        """
        payload = MINIMAL_TERRESTRIAL_OBSERVATION
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)
        draft_record_exists = DraftActivity.objects.filter(id=payload["id"]).exists()
        self.assertFalse(draft_record_exists)
        # self.assertIsNone()

    def test_update_record(self):
        """
        Validates that submitting a Terrestrial Observation payload:
        1. Returns a 200 OK status code.
        2. Verifies configuration code mappings match payload inputs.
        3. Correctly calculates and appends geospatial metadata (centroid).
        4. Accurately saves nested arrays and handles null-value normalization.
        5. Hard-commits expected properties directly to the database.
        """
        payload = UPDATED_TERRESTRIAL_OBSERVATION
        record_id = payload["id"]

        response = self.submit_record(payload)

        data = response.json()

        context_out = data["subtype_data"]["context"]
        context_in = payload["subtype_data"]["context"]

        self.assertEqual(context_out["aspect"]["code"], context_in["aspect"])
        self.assertEqual(
            context_out["slope_percent"]["code"], context_in["slope_percent"]
        )
        self.assertEqual(
            context_out["soil_texture"]["code"], context_in["soil_texture"]
        )

        first_entry_out = data["subtype_data"]["entries"][0]
        first_entry_in = payload["subtype_data"]["entries"][0]

        self.assertIsNone(first_entry_out["density"])
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

        self.assertEqual(db_record.form_status, payload["form_status"])
        self.assertEqual(
            db_record.location_description, payload["location_description"]
        )
        self.assertAlmostEqual(
            float(db_record.latitude), float(payload["latitude"]), places=5
        )
        self.assertEqual(db_record.type, payload["type"])
        self.assertEqual(db_record.subtype, payload["subtype"])

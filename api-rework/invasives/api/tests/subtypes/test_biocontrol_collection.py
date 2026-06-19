from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
    MINIMAL_BIOCONTROL_COLLECTION,
    UPDATED_BIOCONTROL_COLLECTION,
)


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_chemical_treatments.json",
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_waterlevel_management",
        "test/common/test_wind",
        "test/subtypes/biocontrol/test_biocontrol_codes",
        "test/subtypes/biocontrol/test_biocontrol_collection",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        ti = sd["entries"]
        self.assertEqual(len(ti), 1)
        ti = ti[0]
        self.assertEqual(ti["collection_type"], "Timed")
        self.assertEqual(ti["plant_count_collection"], 33)
        self.assertEqual(ti["time_collection_duration_minutes"], 22)
        self.assertEqual(ti["number_of_sweeps"], None)
        self.assertEqual(ti["start_time_collecting"], "2026-01-02T08:00")
        self.assertEqual(ti["end_time_collecting"], "2026-01-02T08:00")
        self.assertEqual(ti["biological_agent"], "CHEIURB")
        self.assertEqual(ti["collection_method"], "Cs")
        self.assertEqual(ti["invasive_plant"], "CT")

        aba = ti["actual_biological_agents"][0]
        self.assertEqual(
            aba["stage"],
            "AD",
        )
        self.assertEqual(aba["quantity"], 111)

        eba = ti["estimated_biological_agents"][0]
        self.assertEqual(
            eba["stage"],
            "EG",
        )
        self.assertEqual(eba["quantity"], 11)

        tpp = sd["target_plant_phenology"]
        self.assertEqual(tpp["winter_dormant"], 10)
        self.assertEqual(tpp["seedlings"], 11)
        self.assertEqual(tpp["rosettes"], 12)
        self.assertEqual(tpp["bolts"], 13)
        self.assertEqual(tpp["flowering"], 14)
        self.assertEqual(tpp["seeds_forming"], 15)
        self.assertEqual(tpp["senescent"], 25)

        # microsite condition
        self.assertEqual(sd["microsite_conditions"]["mesoslope_position"], "LV")
        self.assertEqual(sd["microsite_conditions"]["site_surface_shape"], "LN")

        # weather conditions
        self.assertEqual(sd["weather_conditions"]["wind_speed_kmh"], 22)
        self.assertEqual(sd["weather_conditions"]["temperature"], 32)
        self.assertEqual(sd["weather_conditions"]["cloud_cover"], "1")
        self.assertEqual(sd["weather_conditions"]["precipitation"], "DP")
        self.assertEqual(sd["weather_conditions"]["wind_direction"], "NW")

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_BIOCONTROL_COLLECTION
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Validates a Biocontrol Collection record by evaluating API responses
        dynamically against the input payload and verifying core Activity table data.
        """

        payload = UPDATED_BIOCONTROL_COLLECTION
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        sub_out = data["subtype_data"]
        sub_in = payload["subtype_data"]

        self.assertEqual(
            sub_out["weather_conditions"]["temperature"],
            sub_in["weather_conditions"]["temperature"],
        )
        self.assertEqual(
            sub_out["weather_conditions"]["comments"],
            sub_in["weather_conditions"]["comments"],
        )

        self.assertEqual(
            sub_out["target_plant_phenology"]["flowering"],
            sub_in["target_plant_phenology"]["flowering"],
        )
        self.assertEqual(
            sub_out["target_plant_phenology"]["target_plant_heights"][0]["height_cm"],
            sub_in["target_plant_phenology"]["target_plant_heights"][0]["height_cm"],
        )

        entry_out = sub_out["entries"][0]
        entry_in = sub_in["entries"][0]

        self.assertEqual(entry_out["biological_agent"], entry_in["biological_agent"])
        self.assertEqual(
            entry_out["time_collection_duration_minutes"],
            entry_in["time_collection_duration_minutes"],
        )

        self.assertIsNone(entry_out["plant_count_collection"])
        self.assertIsNone(entry_out["number_of_sweeps"])

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

        self.assertEqual(db_record.form_status, "Submitted")
        self.assertEqual(db_record.created_by, payload["created_by"])
        self.assertEqual(str(db_record.date), payload["date"])

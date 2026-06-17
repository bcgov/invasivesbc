from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
    MINIMAL_BIOCONTROL_RELEASE,
    UPDATED_BIOCONTROL_RELEASE,
)


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_chemical_treatments.json",
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/subtypes/treatments/test_biocontrol_release_codes",
        "test/subtypes/treatments/test_biocontrol_release",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        ti = sd["entries"]
        self.assertEqual(len(ti), 1)
        ti = ti[0]

        self.assertEqual(ti["agent_source"], "Leafy Greens")
        self.assertEqual(ti["biocontrol_agent"], "HYLEEUP")
        self.assertEqual(ti["collection_date"], "2025-04-30T07:00")
        self.assertEqual(ti["invasive_plant"], "CT")
        self.assertEqual(ti["linear_segment"], "Yes")
        self.assertEqual(ti["mortality"], 30)
        self.assertEqual(ti["plant_collected_from"], "JK")
        self.assertEqual(ti["plant_collected_from_manual"], None)

        aba = ti["actual_biological_agents"][0]
        self.assertEqual(
            aba["stage"],
            "B",
        )
        self.assertEqual(aba["quantity"], 11)

        eba = ti["estimated_biological_agents"][0]
        self.assertEqual(
            eba["stage"],
            "B",
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
        payload = MINIMAL_BIOCONTROL_RELEASE
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Validates a Biocontrol Release record by mapping expected dictionary mutations
        directly against incoming data structures, verifying geospatial points,
        and validating base table entries with a literal 200 response status.
        """

        payload = UPDATED_BIOCONTROL_RELEASE
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        sub_out = data["subtype_data"]
        sub_in = payload["subtype_data"]

        self.assertEqual(
            sub_out["weather_conditions"]["precipitation"],
            sub_in["weather_conditions"]["precipitation"],
        )
        self.assertEqual(
            sub_out["weather_conditions"]["cloud_cover"],
            sub_in["weather_conditions"]["cloud_cover"],
        )
        self.assertEqual(
            sub_out["microsite_conditions"]["site_surface_shape"],
            sub_in["microsite_conditions"]["site_surface_shape"],
        )

        self.assertEqual(
            sub_out["target_plant_phenology"]["senescent"],
            sub_in["target_plant_phenology"]["senescent"],
        )
        self.assertEqual(
            sub_out["target_plant_phenology"]["target_plant_heights"][1]["height_cm"],
            sub_in["target_plant_phenology"]["target_plant_heights"][1]["height_cm"],
        )

        entry_out = sub_out["entries"][0]
        entry_in = sub_in["entries"][0]

        self.assertEqual(entry_out["biocontrol_agent"], entry_in["biocontrol_agent"])
        self.assertEqual(entry_out["agent_source"], entry_in["agent_source"])
        self.assertEqual(entry_out["collection_date"], entry_in["collection_date"])
        self.assertEqual(
            entry_out["plant_collected_from_manual"],
            entry_in["plant_collected_from_manual"],
        )
        self.assertEqual(entry_out["linear_segment"], entry_in["linear_segment"])
        self.assertEqual(
            entry_out["actual_biological_agents"][0]["quantity"],
            entry_in["actual_biological_agents"][0]["quantity"],
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
        self.assertEqual(db_record.area_m, payload["area_m"])
        self.assertEqual(db_record.form_status, payload["form_status"])
        self.assertEqual(db_record.comment, payload["comment"])
        self.assertEqual(db_record.created_by, payload["created_by"])
        self.assertEqual(str(db_record.date), payload["date"])

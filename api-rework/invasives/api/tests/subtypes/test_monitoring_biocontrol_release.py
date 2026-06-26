from .base import BaseActivitySubtypeTest
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
    EMPTY_BIOCONTROL_RELEASE_MONITORING,
    MINIMAL_BIOCONTROL_RELEASE_MONITORING,
    UPDATED_BIOCONTROL_RELEASE_MONITORING,
)


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring_codes",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        mi = sd["entries"]

        self.assertEqual(len(mi), 1)
        mi = mi[0]
        self.assertEqual(mi["biocontrol_present"], True)
        self.assertEqual(mi["monitoring_type"], "Timed")
        self.assertEqual(mi["plant_count"], 33)
        self.assertEqual(mi["count_duration_minutes"], 22)
        self.assertEqual(mi["number_of_sweeps"], None)
        self.assertEqual(mi["start_time"], "2026-01-02T08:00")
        self.assertEqual(mi["stop_time"], "2026-01-02T08:00")
        self.assertEqual(mi["suitable_for_collection"], "No")
        self.assertEqual(mi["biocontrol_agent"], "CHEIURB")
        self.assertEqual(mi["monitoring_method"], "Ob")
        self.assertEqual(mi["invasive_plant"], "CT")

        eba = mi["estimated_biological_agents"][0]
        self.assertEqual(eba["stage"], "EG")
        self.assertEqual(eba["quantity"], 11)
        self.assertEqual(
            eba["plant_position"],
            "Pu",
        )
        self.assertEqual(eba["agent_location"], "Pe")

        aba = mi["actual_biological_agents"][0]
        self.assertEqual(
            aba["stage"],
            "AD",
        )
        self.assertEqual(aba["quantity"], 111)
        self.assertEqual(
            aba["plant_position"],
            "Pl",
        )
        self.assertEqual(aba["agent_location"], "Me")

        sbp = mi["sign_of_biocontrol_presence"]
        self.assertEqual(len(sbp), 2)
        for sign in sbp:
            expected = ["ST", "EH"]
            self.assertTrue(sign in expected)

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

        # spread results
        self.assertEqual(sd["spread_results"]["agent_density"], 55)
        self.assertEqual(sd["spread_results"]["plant_attack"], 20)
        self.assertEqual(sd["spread_results"]["max_spread_distance_m"], 300)
        self.assertEqual(sd["spread_results"]["max_spread_aspect_deg"], 320)

    def test_draft_submissions(self):
        self.draft_pydantic_protocol_test(
            empty_record=EMPTY_BIOCONTROL_RELEASE_MONITORING,
            minimal_record=MINIMAL_BIOCONTROL_RELEASE_MONITORING,
            full_record=UPDATED_BIOCONTROL_RELEASE_MONITORING,
        )

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_BIOCONTROL_RELEASE_MONITORING
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        """
        Validates a Biocontrol Release Monitoring record by dynamically matching
        API output parameters directly against the submitted payload source data.
        """

        payload = UPDATED_BIOCONTROL_RELEASE_MONITORING
        record_id = payload["id"]

        response = self.submit_record(payload)
        data = response.json()

        sub_out = data["subtype_data"]
        sub_in = payload["subtype_data"]

        self.assertEqual(
            sub_out["spread_results"]["agent_density"],
            sub_in["spread_results"]["agent_density"],
        )
        self.assertEqual(
            sub_out["spread_results"]["max_spread_distance_m"],
            sub_in["spread_results"]["max_spread_distance_m"],
        )
        self.assertEqual(
            sub_out["spread_results"]["max_spread_aspect_deg"],
            sub_in["spread_results"]["max_spread_aspect_deg"],
        )

        self.assertEqual(
            sub_out["weather_conditions"]["precipitation"],
            sub_in["weather_conditions"]["precipitation"],
        )
        self.assertEqual(
            sub_out["target_plant_phenology"]["bolts"],
            sub_in["target_plant_phenology"]["bolts"],
        )

        entry_out = sub_out["entries"][0]
        entry_in = sub_in["entries"][0]

        self.assertEqual(entry_out["biocontrol_agent"], entry_in["biocontrol_agent"])
        self.assertEqual(entry_out["monitoring_method"], entry_in["monitoring_method"])
        self.assertEqual(
            entry_out["location_agent_found"], entry_in["location_agent_found"]
        )
        self.assertEqual(
            entry_out["sign_of_biocontrol_presence"],
            entry_in["sign_of_biocontrol_presence"],
        )

        self.assertIsNone(entry_out["plant_count"])
        self.assertIsNone(entry_out["number_of_sweeps"])
        self.assertIsNone(entry_out["linear_segment"])

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

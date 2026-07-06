import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import Activity, DraftActivity
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

    def match_updated_subtype_details(
        self,
        record_in: dict,
        record_out: DraftActivity["subtype_data"] | Activity["subtype_data"],
    ):
        # Weather Section
        weather_out = record_out["weather_conditions"]
        weather_in = record_in["weather_conditions"]

        self.assertEqual(weather_in["comments"], weather_out["comments"])
        self.assertEqual(weather_in["cloud_cover"], weather_out["cloud_cover"])
        self.assertEqual(weather_in["precipitation"], weather_out["precipitation"])
        self.assertEqual(weather_in["temperature"], weather_out["temperature"])
        self.assertEqual(weather_in["wind_direction"], weather_out["wind_direction"])
        self.assertEqual(weather_in["wind_speed_kmh"], weather_out["wind_speed_kmh"])

        # Spread Results Section
        spread_in = record_in["spread_results"]
        spread_out = record_out["spread_results"]

        self.assertEqual(spread_in["agent_density"], spread_out["agent_density"])
        self.assertEqual(spread_in["plant_attack"], spread_out["plant_attack"])
        self.assertEqual(
            spread_in["max_spread_distance_m"], spread_out["max_spread_distance_m"]
        )
        self.assertEqual(
            spread_in["max_spread_aspect_deg"], spread_out["max_spread_aspect_deg"]
        )

        # Microsite Condition Section
        micro_in = record_in["microsite_conditions"]
        micro_out = record_out["microsite_conditions"]

        self.assertEqual(
            micro_in["mesoslope_position"], micro_out["mesoslope_position"]
        )
        self.assertEqual(
            micro_in["site_surface_shape"], micro_out["site_surface_shape"]
        )

        # Plant Phenology Section
        tpp_in = record_in["target_plant_phenology"]
        tpp_out = record_out["target_plant_phenology"]

        self.assertEqual(tpp_in["winter_dormant"], tpp_out["winter_dormant"])
        self.assertEqual(tpp_in["seedlings"], tpp_out["seedlings"])
        self.assertEqual(tpp_in["rosettes"], tpp_out["rosettes"])
        self.assertEqual(tpp_in["bolts"], tpp_out["bolts"])
        self.assertEqual(tpp_in["flowering"], tpp_out["flowering"])
        self.assertEqual(tpp_in["seeds_forming"], tpp_out["seeds_forming"])
        self.assertEqual(tpp_in["senescent"], tpp_out["senescent"])

        self.assertGreater(len(tpp_in["target_plant_heights"]), 0)
        self.assertEqual(
            tpp_in["target_plant_heights"], tpp_out["target_plant_heights"]
        )

        # Entry Section
        entry_in = record_in["entries"][0]
        entry_out = record_out["entries"][0]

        self.assertEqual(entry_in["biocontrol_agent"], entry_out["biocontrol_agent"])
        self.assertEqual(
            entry_in["biocontrol_present"], entry_out["biocontrol_present"]
        )
        self.assertEqual(entry_in["invasive_plant"], entry_out["invasive_plant"])
        self.assertEqual(entry_in["monitoring_type"], entry_out["monitoring_type"])
        self.assertEqual(entry_in["monitoring_method"], entry_out["monitoring_method"])
        self.assertEqual(
            entry_in["count_duration_minutes"], entry_out["count_duration_minutes"]
        )
        self.assertEqual(entry_in["start_time"], entry_out["start_time"])
        self.assertEqual(entry_in["stop_time"], entry_out["stop_time"])
        self.assertEqual(
            entry_in["suitable_for_collection"], entry_out["suitable_for_collection"]
        )

        self.assertGreater(
            len(entry_out["sign_of_biocontrol_presence"]),
            0,
            "Sign of Biocontrol Presence not populated",
        )
        self.assertEqual(
            entry_in["sign_of_biocontrol_presence"],
            entry_out["sign_of_biocontrol_presence"],
        )

        self.assertGreater(
            len(entry_out["location_agent_found"]),
            0,
            "Location Agent Found not populated",
        )
        self.assertEqual(
            entry_in["location_agent_found"], entry_out["location_agent_found"]
        )

        self.assertGreater(
            len(entry_in["sign_of_biocontrol_presence"]),
            0,
            "Sign of biocontrol presence was not created",
        )
        self.assertEqual(
            entry_in["sign_of_biocontrol_presence"],
            entry_out["sign_of_biocontrol_presence"],
        )
        self.assertGreater(
            len(entry_in["location_agent_found"]),
            0,
            "Location agent found was not created",
        )
        self.assertEqual(
            entry_in["location_agent_found"], entry_out["location_agent_found"]
        )

        self.assertGreater(
            len(entry_in["actual_biological_agents"]),
            0,
            "'Actual Biological Agents' not populated",
        )
        self.assertGreater(
            len(entry_in["estimated_biological_agents"]),
            0,
            "'Estimated Biological Agents' not populated",
        )
        self.assertEqual(
            entry_in["actual_biological_agents"], entry_out["actual_biological_agents"]
        )
        self.assertEqual(
            entry_in["estimated_biological_agents"],
            entry_out["estimated_biological_agents"],
        )

    def test_draft_submissions(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """

        payload = EMPTY_BIOCONTROL_RELEASE_MONITORING

        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)

        record_exists = DraftActivity.objects.filter(pk=payload["id"]).exists()
        self.assertTrue(record_exists, "Record failed to be created")

    def test_update_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is updated in DB
        """
        payload = copy.deepcopy(UPDATED_BIOCONTROL_RELEASE_MONITORING)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_BIOCONTROL_RELEASE_MONITORING)

        # Update Draft Record
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        # Update didn't delete DraftActivity,
        record_exists = DraftActivity.objects.filter(id=payload["id"]).exists()
        self.assertTrue(record_exists, "Record no longer exists in DB after update")

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
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
        payload = UPDATED_BIOCONTROL_RELEASE_MONITORING

        # Set Initial Record
        self.submit_record(MINIMAL_BIOCONTROL_RELEASE_MONITORING)

        # Update Record
        response = self.submit_record(payload)
        record = response.json()

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
        )

    def test_draft_record_was_removed_by_submit(self):
        payload = MINIMAL_BIOCONTROL_RELEASE_MONITORING
        self.draft_record_was_removed_by_submit(payload)

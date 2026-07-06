import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import Activity, DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_BIOCONTROL_RELEASE,
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

        self.assertEqual(entry_in["invasive_plant"], entry_out["invasive_plant"])
        self.assertEqual(entry_in["biocontrol_agent"], entry_out["biocontrol_agent"])
        self.assertEqual(entry_in["linear_segment"], entry_out["linear_segment"])
        self.assertEqual(entry_in["agent_source"], entry_out["agent_source"])
        self.assertEqual(entry_in["collection_date"], entry_out["collection_date"])
        self.assertEqual(entry_in["mortality"], entry_out["mortality"])
        self.assertEqual(
            entry_in["plant_collected_from"], entry_out["plant_collected_from"]
        )
        self.assertEqual(
            entry_in["plant_collected_from_manual"],
            entry_out["plant_collected_from_manual"],
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

    def test_initial_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """
        payload = EMPTY_BIOCONTROL_RELEASE

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
        payload = copy.deepcopy(UPDATED_BIOCONTROL_RELEASE)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_BIOCONTROL_RELEASE)

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
        payload = MINIMAL_BIOCONTROL_RELEASE
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_record(self):
        payload = UPDATED_BIOCONTROL_RELEASE

        response = self.submit_record(payload)
        record = response.json()

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"], record_out=record["subtype_data"]
        )

    def test_draft_record_was_removed_by_submit(self):
        payload = MINIMAL_BIOCONTROL_RELEASE
        self.draft_record_was_removed_by_submit(payload)

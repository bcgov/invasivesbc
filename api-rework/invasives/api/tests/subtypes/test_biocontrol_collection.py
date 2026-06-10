from .base import BaseActivitySubtypeTest
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
        """Expect Submitting a record returns 200"""
        self.submit_record(MINIMAL_BIOCONTROL_RELEASE)

    def test_update_record(self):
        """Expect Submitting an updated record returns 200"""
        self.submit_record(UPDATED_BIOCONTROL_RELEASE)

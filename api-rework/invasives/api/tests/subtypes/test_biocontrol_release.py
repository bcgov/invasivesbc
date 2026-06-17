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
            - Fetching record matches result returned by API
        """
        create_return = self.submit_record(MINIMAL_BIOCONTROL_RELEASE).json()
        fetch_return = self.fetch(id=MINIMAL_BIOCONTROL_RELEASE["id"]).json()

        self.assertEqual(
            create_return,
            fetch_return,
            "Serialized response from API did not match expected result from fetch request.",
        )

    def test_update_record(self):
        """
        Expect:
            - Submitting an updated record returns 200
            - Existing record is updated
            - Fetching record matches results.
        """
        update_return = self.submit_record(UPDATED_BIOCONTROL_RELEASE).json()
        fetch_return = self.fetch(id=UPDATED_BIOCONTROL_RELEASE["id"]).json()

        self.assertEqual(
            update_return,
            fetch_return,
            "Serialized response from API did not match expected result from fetch request.",
        )

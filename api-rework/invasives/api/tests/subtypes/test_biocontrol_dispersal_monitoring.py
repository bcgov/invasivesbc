from .base import BaseActivitySubtypeTest


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/subtypes/biocontrol/test_biocontrol_dispersal_monitoring_codes",
        "test/subtypes/biocontrol/test_biocontrol_dispersal_monitoring",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(
            expected_subtype_key="monitoring_information"
        )

    def test_subtype_details_full(self):
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        mi = sd["monitoring_information"]

        self.assertEqual(len(mi), 1)
        mi = mi[0]
        self.assertEqual(mi["biocontrol_present"], True)
        self.assertEqual(mi["monitoring_type"], "Timed")
        self.assertEqual(mi["plant_count"], 33)
        self.assertEqual(mi["count_duration_minutes"], 22)
        self.assertEqual(mi["number_of_sweeps"], None)
        self.assertEqual(mi["start_time"], "2026-01-02T08:00:00Z")
        self.assertEqual(mi["stop_time"], "2026-01-02T08:00:00Z")
        self.assertEqual(mi["suitable_for_collection"], "No")
        self.assertEqual(mi["biocontrol_agent"], "CHEIURB")
        self.assertEqual(mi["monitoring_method"], "Cs")
        self.assertEqual(mi["invasive_plant"], "CT")
        self.assertEqual(mi["linear_segment"], "Yes")
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
        self.assertEqual(sd["mesoslope_position"], "LV")
        self.assertEqual(sd["site_surface_shape"], "LN")

        # weather conditions
        self.assertEqual(sd["wind_speed_kmh"], 22)
        self.assertEqual(sd["temperature"], 32)
        self.assertEqual(sd["cloud_cover"], "1")
        self.assertEqual(sd["precipitation"], "DP")
        self.assertEqual(sd["wind_direction"], "NW")

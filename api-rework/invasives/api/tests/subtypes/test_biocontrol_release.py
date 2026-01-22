from .base import BaseActivitySubtypeTest


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/subtypes/treatments/test_biocontrol_release_codes",
        "test/subtypes/treatments/test_biocontrol_release",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_no_pac_number_present(self):
        self.no_pac_number_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(
            expected_subtype_key="treatment_information"
        )

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()

        sd = response_object["subtype_data"]

        ti = sd["treatment_information"]
        self.assertEqual(len(ti), 1)
        ti = ti[0]

        self.assertEqual(ti["agent_source"], "Leafy Greens")
        self.assertEqual(ti["biocontrol_agent"], "HYLEEUP")
        self.assertEqual(ti["collection_date"], "2025-04-30T07:00:00Z")
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
        self.assertEqual(sd["mesoslope_position"], "LV")
        self.assertEqual(sd["site_surface_shape"], "LN")

        # weather conditions
        self.assertEqual(sd["wind_speed_kmh"], 22)
        self.assertEqual(sd["temperature"], 32)
        self.assertEqual(sd["cloud_cover"], "1")
        self.assertEqual(sd["precipitation"], "DP")
        self.assertEqual(sd["wind_direction"], "NW")

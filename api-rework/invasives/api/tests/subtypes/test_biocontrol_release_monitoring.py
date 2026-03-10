from .base import BaseActivitySubtypeTest


class BiocontrolReleaseTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_invasive_plant_codes",
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
        self.assertEqual(mi["monitoring_method"], "Cs")
        self.assertEqual(mi["invasive_plant"], "CT")
        # linear spread should be removed from this record type. Serializer rule in place.
        self.assertNotIn("linear_segment", mi)

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

        # spread results
        self.assertEqual(sd["agent_density"], 55)
        self.assertEqual(sd["plant_attack"], 20)
        self.assertEqual(sd["max_spread_distance_m"], 300)
        self.assertEqual(sd["max_spread_aspect_deg"], 320)

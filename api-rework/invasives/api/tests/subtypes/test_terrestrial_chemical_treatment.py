from .base import BaseActivitySubtypeTest


class TerrestrialChemicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/treatments/test_chemical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_chemical_treatment",
        "test/common/test_nearest_wells",
        "test/common/test_participants",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_pac_number_is_present(self):
        self.pac_number_is_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(expected_subtype_key="well_entries")

    def test_subtype_values(self):
        record = self.fetch_a().json()
        sd = record["subtype_data"]
        self.assertIsNotNone(sd)

        self.assertEqual(sd["service_license_number"], "0")
        self.assertEqual(sd["pesticide_use_permit"], "none")
        self.assertEqual(sd["pest_management_plan"], "BCGOV")
        self.assertEqual(sd["temperature_c"], 23)
        self.assertEqual(sd["wind_speed_kmh"], 33)
        self.assertEqual(sd["application_start_time"], "2025-01-01T00:00:00Z")
        self.assertEqual(sd["wind_direction"], "NW")
        self.assertEqual(sd["humidity"], 30)
        self.assertEqual(sd["treatment_notice_signs"], "Yes")
        self.assertEqual(sd["precautionary_statement"], "COM")
        self.assertEqual(sd["ntz_reduction_bool"], True)
        self.assertEqual(sd["rationale_for_ntz_reduction"], "stated rationale")
        self.assertEqual(sd["additional_unmapped_well_water_bool"], True)
        self.assertEqual(sd["pest_injury_threshold_determination_bool"], True)

        wells = sd["well_entries"]
        self.assertEqual(len(wells), 3)

        for well in wells:
            self.assertIsNotNone(well["well_tag_number"])
            self.assertIsNotNone(well["distance"])

        if sd["entries"] != "NOT IMPLEMENTED":
            # TODO
            self.fail("UPDATE TESTS FOR CHEM TREATMENT DETAILS")

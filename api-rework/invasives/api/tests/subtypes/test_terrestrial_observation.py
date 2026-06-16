from .base import BaseActivitySubtypeTest
from api.tests.mock_frontend_submissions import (
    MINIMAL_TERRESTRIAL_OBSERVATION,
    UPDATED_TERRESTRIAL_OBSERVATION,
)


class TerrestrialObservationTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        sd = response_object["subtype_data"]

        self.assertEqual(
            sd["context"]["suitable_for_biocontrol_agent"],
            "Yes",
        )
        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "NO")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "N")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "SS")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "M")
        self.assertEqual(sd["pretreatment_observation"], "Yes")
        self.assertGreaterEqual(len(sd["entries"]), 1)

        od = sd["entries"][0]
        self.assertEqual(od["density"], "D")
        self.assertEqual(od["distribution"], "WS")
        self.assertEqual(od["invasive_plant"], "JK")
        self.assertEqual(od["life_stage"], "U")
        self.assertEqual(od["observation_type"], "Positive")

        vs = od["voucher_specimen"]
        self.assertEqual(vs["voucher_sample_id"], "123")
        self.assertEqual(vs["date_collected"], "2025-01-21")
        self.assertEqual(vs["date_verified"], "2025-01-22")
        self.assertEqual(vs["herbarium"], "Johns Herbarium")
        self.assertEqual(vs["accession_number"], "123")
        self.assertEqual(vs["completed_by_person"], "Jane Doe")
        self.assertEqual(vs["completed_by_org"], "BC Gov")
        self.assertEqual(vs["utm_zone"], 10)
        self.assertEqual(vs["utm_easting"], 6543232)
        self.assertEqual(vs["utm_northing"], 123456)

    def test_subtype_details_partial(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_b().json()
        sd = response_object["subtype_data"]

        self.assertEqual(sd["context"]["suitable_for_biocontrol_agent"], "No")
        self.assertEqual(sd["pretreatment_observation"], "No")
        self.assertEqual(len(sd["context"]["specific_uses"]), 1)
        self.assertEqual(sd["context"]["specific_uses"][0]["specific_use"], "GP")
        self.assertEqual(sd["context"]["research_observation"], "Yes")
        self.assertEqual(sd["context"]["visible_well_nearby"], "Unknown")
        self.assertEqual(sd["context"]["aspect"]["code"], "NA")
        self.assertEqual(sd["context"]["slope_percent"]["code"], "VT")
        self.assertEqual(sd["context"]["soil_texture"]["code"], "F")
        self.assertEqual(len(sd["entries"]), 2)

        obs_detail = [
            {
                "density": "D",
                "distribution": "WS",
                "invasive_plant": "JK",
                "life_stage": "U",
                "observation_type": "Positive",
                "voucher_specimen": None,
            },
            {
                "invasive_plant": "CT",
                "observation_type": "Negative",
                "density": None,
                "voucher_specimen": None,
                "life_stage": None,
                "distribution": None,
            },
        ]

        self.assertCountEqual(obs_detail, sd["entries"])

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
            - Fetching record matches result returned by API
        """
        create_return = self.submit_record(MINIMAL_TERRESTRIAL_OBSERVATION).json()
        fetch_return = self.fetch(id=MINIMAL_TERRESTRIAL_OBSERVATION["id"]).json()

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
        update_return = self.submit_record(UPDATED_TERRESTRIAL_OBSERVATION).json()
        fetch_return = self.fetch(id=UPDATED_TERRESTRIAL_OBSERVATION["id"]).json()

        self.assertEqual(
            update_return,
            fetch_return,
            "Serialized response from API did not match expected result from fetch request.",
        )

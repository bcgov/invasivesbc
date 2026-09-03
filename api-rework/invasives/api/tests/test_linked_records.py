import copy
from .subtypes.base import BaseActivitySubtypeTest
from api.tests.mock_frontend_submissions import (
    UPDATED_TERRESTRIAL_OBSERVATION,
    UPDATED_MECH_TREATMENT_TERRESTRIAL,
    UPDATED_MONITORING_MECH_TREATMENT,
)


class LinkedActivityTests(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_invasive_plant_codes",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_employer",
        "test/common/test_participants",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_mechanical_treatment",
    ]

    def _get_random_ocean_feature(self):
        """
        Random Feature for testing invalid Geojson in linking. Does not overlap any known record
        """
        return {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-123.8546835104566, 49.33264258114489],
                        [-123.85470695780445, 49.3326337593165],
                        [-123.85470695779607, 49.33261611566446],
                        [-123.8546835104566, 49.3326072938408],
                        [-123.85466006311715, 49.33261611566446],
                        [-123.85466006310877, 49.3326337593165],
                        [-123.8546835104566, 49.33264258114489],
                    ]
                ],
            },
        }

    def test_linking_record_successful(self):
        """
        Expect:
            - Submitting an appropriately linked record gets approved e.g.: Treatment -> Observation
        """
        init_record = UPDATED_TERRESTRIAL_OBSERVATION
        self.submit_record(init_record)
        linking_record = UPDATED_MECH_TREATMENT_TERRESTRIAL
        linking_record["linked_activities"] = [
            {"label": init_record["short_id"], "full": init_record["id"]}
        ]
        linking_record["shape"] = init_record["shape"]
        response = self.submit_record(linking_record)
        record = response.json()
        self.assertEqual(len(record["linked_activities"]), 1)

    def test_linking_record_failed_shape(self):
        """
        Expect:
            - Submitting an Appropriate type of linked record, but with invalid shape, gets denies.
        """
        init_record = UPDATED_TERRESTRIAL_OBSERVATION
        self.submit_record(init_record)
        linking_record = UPDATED_MECH_TREATMENT_TERRESTRIAL
        linking_record["linked_activities"] = [
            {"label": init_record["short_id"], "full": init_record["id"]}
        ]
        linking_record["shape"] = self._get_random_ocean_feature()
        response = self._post_record(payload=linking_record, type="submit")
        self.assertEqual(response.status_code, 422)

    def test_linking_record_failed_type(self):
        """
        Expect:
            - Submitting an inappropriate type of linked record e.g.: Monitoring -> Observation gets denied
        """
        init_record = UPDATED_TERRESTRIAL_OBSERVATION
        self.submit_record(init_record)
        linking_record = UPDATED_MONITORING_MECH_TREATMENT
        linking_record["linked_activities"] = [
            {"label": init_record["short_id"], "full": init_record["id"]}
        ]
        linking_record["shape"] = init_record["shape"]
        response = self._post_record(payload=linking_record, type="submit")
        self.assertEqual(response.status_code, 422)

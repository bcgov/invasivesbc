from api.models.activity import ActivitySubtypes
from api.configs.exports import build_csv_annotation_object

from .base_csv import BaseCSVTest


class TestTerrestrialObservationCSV(BaseCSVTest):
    fixtures = [
        "test/subtypes/observations/test_terrestrial_observation_codes.json",
        "test/subtypes/observations/test_terrestrial_observation.json",
        "test/common/test_employer.json",
        "test/common/test_project_codes.json",
        "test/common/test_funding_agency.json",
        "test/common/test_invasive_plant_codes.json",
        "test/common/test_jurisdictions.json",
        "test/common/test_nearest_wells.json",
        "test/common/test_participants.json",
    ]

    def setUp(self):
        self.filter_id = "25PTO6BBA2749"
        super().setUp(
            ActivitySubtypes.Observation_Plant_Terrestrial.name, self.filter_id
        )

    def test_fields_are_populated(self):
        """
        Using Terrestrial Plant Observations as an entry source, check that all generic headers for CSV exports get populated.
        """

        EXPECTED_ROWS = 2
        generic_fields = [anno["header"] for anno in build_csv_annotation_object([])]
        rows = self.get_csv(filter=True)
        self.assertEqual(len(rows), EXPECTED_ROWS)
        for field in generic_fields:
            idx = rows[self.HEADERS].index(field)
            self.assertTrue(rows[self.FIRST][idx])

    def test_unauthenticated(self):
        """Will fail with 403"""
        self.get_csv(auth=False)

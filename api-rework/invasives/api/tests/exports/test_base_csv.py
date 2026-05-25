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
        self.filter_id = None
        super().setUp(
            ActivitySubtypes.Observation_Plant_Terrestrial.name, self.filter_id
        )

    def test_unauthenticated(self):
        """Will fail with 403"""
        self.get_csv(auth=False)

    def test_columns_populate(self):
        """Override to Default annotations for the test columns populate test"""

        self.subtype_annotations = build_csv_annotation_object([])
        self.verify_subtype_columns_populate()

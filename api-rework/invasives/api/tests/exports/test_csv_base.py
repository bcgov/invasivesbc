from api.models.activity import ActivitySubtypes
from api.configs.exports import build_csv_annotation_object

from .base_csv import BaseCSVTest


class TestTerrestrialObservationCSV(BaseCSVTest):
    fixtures = [
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/common/test_employer_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_employer",
        "test/common/test_project_codes",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_jurisdictions",
        "test/common/test_nearest_wells",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = None
        super().setUp(
            subtype=ActivitySubtypes.Observation_Plant_Terrestrial.name,
            filter_id=self.filter_id,
            number_expected_entries=None,
        )

    def test_unauthenticated(self):
        """Will fail with 403"""
        self.get_csv(auth=False)

    def test_columns_populate(self):
        """Override to Default annotations for the test columns populate test"""

        self.subtype_annotations = build_csv_annotation_object([])
        self.verify_subtype_columns_populate()

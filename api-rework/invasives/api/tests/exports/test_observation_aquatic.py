from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestTerrestrialObservationCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/observations/test_aquatic_observation_codes",
        "test/subtypes/observations/test_aquatic_observation",
        "test/common/test_participants",
        "test/common/test_waterbody_substrate.json",
        "test/common/test_waterbody_type.json",
        "test/common/test_waterlevel_management.json",
        "test/common/test_wind.json",
    ]

    def setUp(self):
        self.filter_id = "25PAO6BBA2749"
        super().setUp(
            subtype=ActivitySubtypes.Observation_Plant_Aquatic.name,
            filter_id=self.filter_id,
            number_expected_entries=3,
        )

    def test_get_unfiltered_csv(self):
        self.verify_unfiltered_csv()

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        self.verify_csv_filters()

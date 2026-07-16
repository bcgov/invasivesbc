from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestMonitoringBiocontrolReleaseCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind_codes",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring_codes",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PBM6BBA2749"
        super().setUp(
            subtype=ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name,
            filter_id=self.filter_id,
            number_expected_entries=2,
        )

    def test_get_unfiltered_csv(self):
        self.verify_unfiltered_csv()

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        self.verify_csv_filters()

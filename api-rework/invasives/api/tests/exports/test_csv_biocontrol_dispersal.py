from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestBiocontrolDispersalCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind_codes",
        "test/subtypes/biocontrol/test_biocontrol_codes",
        "test/subtypes/biocontrol/test_biocontrol_dispersal_monitoring",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PBDCD542709"
        super().setUp(
            subtype=ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name,
            filter_id=self.filter_id,
            number_expected_entries=2,
        )

    def test_get_unfiltered_csv(self):
        self.verify_unfiltered_csv()

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        self.verify_csv_filters()

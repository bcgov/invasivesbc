from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestBiocontrolCollectionCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/subtypes/biocontrol/test_biocontrol_codes",
        "test/subtypes/biocontrol/test_biocontrol_collection",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PBCCD542709"
        super().setUp(
            subtype=ActivitySubtypes.Biocontrol_Collection.name,
            filter_id=self.filter_id,
            expected_unfiltered_rows=3,
        )

    def test_get_unfiltered_csv(self):
        self.verify_unfiltered_csv()

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        self.verify_csv_filters()

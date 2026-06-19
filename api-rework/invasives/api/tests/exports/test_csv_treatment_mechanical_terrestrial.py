from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestTreatmentMechanicalTerrestrialCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_mechanical_treatment",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PTMCD542709"
        super().setUp(
            subtype=ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name,
            filter_id=self.filter_id,
            number_expected_entries=3,
        )

    def test_get_unfiltered_csv(self):
        self.verify_unfiltered_csv()

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        self.verify_csv_filters()

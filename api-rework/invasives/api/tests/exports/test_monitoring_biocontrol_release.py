from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestMonitoringBiocontrolReleaseCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring_codes",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PBM6BBA2749"
        super().setUp(
            ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name,
            self.filter_id,
        )

    def test_get_unfiltered_csv(self):
        """
        Expect a CSV containing 4 rows.
            - Headers (1 row)
            - 3 Plants (1 plant per row)
        """
        EXPECTED_ROWS = 3
        rows = self.get_csv()
        self.assertEqual(len(rows), EXPECTED_ROWS)

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        """Test filtering on an ID for a record with one plant entries."""
        rows = self.get_csv(filter=True)
        for row in rows[1:]:
            targ_index = rows[self.HEADERS].index("ID")
            self.assertEqual(row[targ_index], self.filter_id)

from api.models.activity import ActivitySubtypes
from .base_csv import BaseCSVTest


class TestBiocontrolReleaseCSV(BaseCSVTest):
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/common/test_wind",
        "test/subtypes/treatments/test_biocontrol_release_codes",
        "test/subtypes/treatments/test_biocontrol_release",
        "test/common/test_participants",
    ]

    def setUp(self):
        self.filter_id = "25PBRCD542709"
        super().setUp(
            ActivitySubtypes.Biocontrol_Release.name,
            self.filter_id,
        )

    def test_get_unfiltered_csv(self):
        EXPECTED_ROWS = 3
        rows = self.get_csv()
        self.assertEqual(len(rows), EXPECTED_ROWS)

    def test_all_terrestrial_fields_populate(self):
        self.verify_subtype_columns_populate()

    def test_get_filtered_csv(self):
        """Test filtering on an ID for a record with one plant entries."""
        rows = self.get_csv(filter=True)

        self.assertGreaterEqual(len(rows), 2)
        for row in rows[1:]:
            targ_index = rows[self.HEADERS].index("ID")
            self.assertEqual(row[targ_index], self.filter_id)

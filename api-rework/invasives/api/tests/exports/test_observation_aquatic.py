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
        super().setUp(ActivitySubtypes.Observation_Plant_Aquatic.name, self.filter_id)

    def test_get_unfiltered_csv(self):
        """
        Expect a CSV containing 4 rows.
            - Headers (1 row)
            - 3 Plants (1 plant per row)
        """
        EXPECTED_ROWS = 4
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

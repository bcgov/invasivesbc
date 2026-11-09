from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase

from api.legacy_db.db import LegacyDB
from api.legacy_db.migrate import MigrationCumulativeTaskResult, MigrationTaskResult
from api.tests.test_iapp_serializer import site_row


class IAPPMigrationTests(SimpleTestCase):
    @patch("api.legacy_db.db.pretty.pprint")
    @patch("api.legacy_db.db.fetch_iapp_site_rows")
    @patch("api.legacy_db.db.psycopg.connect")
    def test_migrate_iapp_tracks_parse_results_and_prints_dry_run_sites(
        self, connect, fetch_rows, pprint
    ):
        conn = MagicMock()
        connect.return_value.__enter__.return_value = conn
        valid_row = site_row()
        invalid_row = site_row()
        invalid_row["site_id"] = "invalid"
        fetch_rows.return_value = iter([valid_row, invalid_row])

        stats = LegacyDB.migrate_iapp(dry_run=True)

        self.assertEqual(stats.total, 2)
        self.assertEqual(stats.parse_ok, 1)
        self.assertEqual(stats.failed_parse, [str(invalid_row["site_id"])])
        self.assertEqual(stats.failed_save, [])
        fetch_rows.assert_called_once_with(conn, None)
        pprint.assert_called_once()

    @patch("api.legacy_db.db.fetch_iapp_site_rows")
    @patch("api.legacy_db.db.psycopg.connect")
    def test_random_sample_site_ids_are_passed_to_fetch(self, connect, fetch_rows):
        conn = MagicMock()
        connect.return_value.__enter__.return_value = conn
        cursor = MagicMock()
        conn.cursor.return_value.__enter__.return_value = cursor
        cursor.execute.return_value.fetchall.return_value = [
            {"site_id": 123},
            {"site_id": 456},
        ]
        fetch_rows.return_value = []

        LegacyDB.migrate_iapp(dry_run=True, source="random-sample")

        fetch_rows.assert_called_once_with(conn, [123, 456])
        query = cursor.execute.call_args.args[0]
        self.assertLess(
            query.index("SELECT DISTINCT site_id"), query.index("WHERE random()")
        )

    def test_cumulative_result_failure_lists_are_instance_local(self):
        first = MigrationCumulativeTaskResult()
        second = MigrationCumulativeTaskResult()

        first.add(MigrationTaskResult(record_id="site-1", save_skipped=True))

        self.assertEqual(first.failed_parse, ["site-1"])
        self.assertEqual(second.failed_parse, [])
        self.assertEqual(first.failed_save, [])
        self.assertEqual(second.failed_save, [])

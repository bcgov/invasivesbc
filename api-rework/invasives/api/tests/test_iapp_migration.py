from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, TestCase

from api.legacy_db.db import LegacyDB
from api.legacy_db.migrate import MigrationCumulativeTaskResult, MigrationTaskResult
from api.models.iapp import IAPPSite, IAPPSurvey
from api.tests.test_iapp_serializer import full_site_row, site_row


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


class IAPPMigrationSaveTests(TestCase):
    def migrate(self, rows, **kwargs):
        with (
            patch("api.legacy_db.db.psycopg.connect") as connect,
            patch("api.legacy_db.db.fetch_iapp_site_rows") as fetch_rows,
        ):
            connect.return_value.__enter__.return_value = MagicMock()
            fetch_rows.return_value = iter(rows)
            return LegacyDB.migrate_iapp(**kwargs)

    def test_new_sites_are_created(self):
        stats = self.migrate([full_site_row()])

        self.assertEqual((stats.total, stats.parse_ok, stats.save_ok), (1, 1, 1))
        self.assertEqual(stats.pre_existing, 0)
        self.assertEqual(stats.failed_save, [])
        self.assertEqual(IAPPSurvey.objects.count(), 1)

    def test_dry_run_saves_nothing(self):
        with patch("api.legacy_db.db.pretty.pprint"):
            stats = self.migrate([full_site_row()], dry_run=True)

        self.assertEqual((stats.save_skipped, stats.save_ok), (1, 0))
        self.assertFalse(IAPPSite.objects.exists())

    def test_existing_sites_are_skipped_without_clobber(self):
        self.migrate([full_site_row()])
        changed = full_site_row()
        changed["surveys"][0]["survey_agency"] = "Changed"

        stats = self.migrate([changed])

        self.assertEqual(
            (stats.pre_existing, stats.save_skipped, stats.save_ok), (1, 1, 0)
        )
        self.assertEqual(stats.failed_save, [])
        self.assertNotEqual(IAPPSurvey.objects.get().survey_agency, "Changed")

    def test_existing_sites_are_refreshed_with_clobber(self):
        self.migrate([full_site_row()])
        changed = full_site_row()
        changed["surveys"][0]["survey_agency"] = "Changed"

        stats = self.migrate([changed], clobber=True)

        self.assertEqual(
            (stats.pre_existing, stats.clobbered, stats.save_ok), (1, 1, 1)
        )
        self.assertEqual(IAPPSurvey.objects.get().survey_agency, "Changed")

    def test_save_failures_are_tracked_and_do_not_stop_the_run(self):
        too_long = full_site_row()
        too_long["site_selections"][0]["mapsheet"] = "x" * 50
        valid = site_row()
        valid["site_id"] = 2
        for key, pk in (
            ("site_selections", "siteselectionid"),
            ("surveys", "surveyid"),
        ):
            valid[key][0]["site_id"] = 2
            valid[key][0][pk] += 1000

        stats = self.migrate([too_long, valid])

        self.assertEqual(stats.django_validation_failed, 1)
        self.assertEqual(stats.failed_validation, ["1"])
        self.assertEqual(stats.failed_save, ["1"])
        self.assertEqual(stats.save_ok, 1)
        self.assertFalse(IAPPSite.objects.filter(pk=1).exists())
        self.assertTrue(IAPPSite.objects.filter(pk=2).exists())

import logging
from pprint import pformat

from django.core.management.base import BaseCommand

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse legacy entries only, do not copy into new database",
            action="store_true",
        )
        parser.add_argument(
            "--clobber",
            help="Overwrite previously-migrated activities (use with caution!)",
            action="store_true",
        )
        parser.add_argument(
            "--source", choices=["all", "random-sample", "single"], default="all"
        )
        parser.add_argument(
            "--restrict-to-subtype",
            default=None,
            help="Restrict import to a particular subtype. Probably something like 'Activity_Observation_PlantTerrestrial'",
        )
        parser.add_argument(
            "pk",
            nargs="?",
            type=str,
            help="The primary key (UUID identifier) of the single activity to import",
        )

        pass

    def handle(self, *args, **options):
        if (options["source"] == "single") and options["pk"] is None:
            raise Exception("pk is required if source is 'single'")

        if options["source"] != "single" and options["pk"] is not None:
            raise Exception("pk is only allowed if source is 'single'")

        if options["clobber"] and options["dry_run"]:
            raise Exception("--clobber cannot be used with --dry-run")

        stats = LegacyDB.migrate_activities(
            dry_run=options["dry_run"],
            source=options["source"],
            pk=options["pk"],
            clobber=options["clobber"],
            restrict_to_subtype=options["restrict_to_subtype"],
        )

        logging.info(pformat(stats))

        if stats.pending_links_created > 0:
            logging.info(
                "Pending links were created. Run `import_activity_links` to import them"
            )

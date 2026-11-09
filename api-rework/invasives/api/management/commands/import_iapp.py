import logging

from django.core.management.base import BaseCommand, CommandError

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Parse or migrate legacy IAPP sites"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse and print legacy IAPP sites without saving",
            action="store_true",
        )
        parser.add_argument(
            "--clobber",
            help="Overwrite previously migrated records (currently unused)",
            action="store_true",
        )
        parser.add_argument("--source", choices=["all", "random-sample"], default="all")

    def handle(self, *args, **options):
        if options["clobber"] and options["dry_run"]:
            raise CommandError("--clobber cannot be used with --dry-run")

        LegacyDB.migrate_iapp(
            dry_run=options["dry_run"],
            clobber=options["clobber"],
            source=options["source"],
        )
        logging.info("IAPP import run complete")

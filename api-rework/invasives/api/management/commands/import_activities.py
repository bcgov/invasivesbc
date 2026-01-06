from django.core.management.base import BaseCommand
from rich.pretty import pprint

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse legacy entries only, do not copy into new database",
            action="store_true",
        )
        parser.add_argument("--source", choices=["all", "random-sample"], default="all")
        pass

    def handle(self, *args, **options):
        stats = LegacyDB.migrate_activities(
            dry_run=options["dry_run"], source=options["source"]
        )
        pprint(stats)

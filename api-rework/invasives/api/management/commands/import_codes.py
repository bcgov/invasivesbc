from django.core.management.base import BaseCommand
from rich.pretty import pprint

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy codes"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse legacy codes only, do not copy into new database",
            action="store_true",
        )
        pass

    def handle(self, *args, **options):
        stats = LegacyDB.migrate_codes(dry_run=options["dry_run"])
        pprint(stats)

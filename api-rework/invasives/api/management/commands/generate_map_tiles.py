import logging
from pprint import pformat

from django.core.management.base import BaseCommand

from api.services.map_tile_generator.tile_downloader import TileDownloader


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Show what would be done, but do not generate map tiles.",
            action="store_true",
        )

        parser.add_argument(
            "--skip-pmtiles",
            help="Do not create a protomap archive, only download the tiles. Also skips upload (since there is no archive to upload)",
            action="store_true",
        )

        parser.add_argument(
            "--skip-upload",
            help="Do not upload the generated tiles, only store them locally.",
            action="store_true",
        )

        pass

    def handle(self, *args, **options):

        stats = TileDownloader.generate_map_tiles(
            dry_run=options["dry_run"],
            skip_pmtiles=options["skip_pmtiles"],
            skip_upload=options["skip_upload"],
        )

        logging.info(pformat(stats))

import logging
from pprint import pformat

from django.core.management.base import BaseCommand

from api.services.map_tile_generator.tile_downloader import TileDownloader
from invasivesbc.settings import SCRATCH_DIRECTORY, TILE_CACHE_MAXIMUM_SIZE


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        logging.info(f"output to {SCRATCH_DIRECTORY}")
        logging.info(
            f"max cache size {TILE_CACHE_MAXIMUM_SIZE} ({round(TILE_CACHE_MAXIMUM_SIZE/(1024*1024), 0)}MB)"
        )

        stats = TileDownloader.generate_map_tiles()

        logging.info(pformat(stats))

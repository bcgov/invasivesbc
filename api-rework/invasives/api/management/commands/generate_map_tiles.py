import logging
from pprint import pformat

from django.core.management.base import BaseCommand

from api.services.map_tile_generator.tile_downloader import TileDownloader


class Command(BaseCommand):
    help = "Simulate or perform a migration of legacy activities"

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):

        stats = TileDownloader.generate_map_tiles()

        logging.info(pformat(stats))

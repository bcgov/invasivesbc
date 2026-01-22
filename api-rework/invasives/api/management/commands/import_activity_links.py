import logging
from pprint import pformat

from django.core.management.base import BaseCommand

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Simulate or perform a activity linkages on previously-imported activities"

    def handle(self, *args, **options):

        stats = LegacyDB.migrate_links()

        logging.info(pformat(stats))

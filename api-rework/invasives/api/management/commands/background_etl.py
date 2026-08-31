import logging

from api.tasks import run_full_etl
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Queue the full ETL process to run in the background (via Celery)"

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        logging.info(f"Task started -- ID {run_full_etl.delay()}")

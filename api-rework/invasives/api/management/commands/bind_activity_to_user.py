import logging
from pprint import pformat
from typing import Set

from api.models.activity import Activity
from api.models.auth import HistoricalUserName
from django.core.management.base import BaseCommand

from api.legacy_db.db import LegacyDB


class Command(BaseCommand):
    help = "Simulate or perform a binding of activities to users. both user and activity imports should have been done previously."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse legacy users only, do not copy into new database",
            action="store_true",
        )
        pass

    def handle(self, *args, **options):
        checked = 0
        matched = 0
        unmatched = 0

        distinct_unmatched: Set[str] = set()

        for a in Activity.objects.filter(creating_user=None).all():
            checked += 1
            matched_user = HistoricalUserName.objects.filter(
                historical_username=a.created_by
            ).first()
            if not matched_user:
                logging.warning(f"No matching user found for {a.created_by}")
                distinct_unmatched.add(a.created_by)
                unmatched += 1
            if matched_user:
                matched += 1
                if not options["dry_run"]:
                    a.creating_user = matched_user.user
                    a.save(update_fields=["creating_user"])

        logging.info(f"checked: {checked}, matched {matched}, unmatched: {unmatched}")

        if len(distinct_unmatched) > 0:
            logging.warning(f"Users with no match: {', '.join(distinct_unmatched)}")

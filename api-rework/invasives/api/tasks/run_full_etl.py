from pprint import pformat

from api.legacy_db.db import LegacyDB
from celery import chain
from invasivesbc import celery_app
import logging


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_codes(self):
    logging.info("Adding hardcoded codes")
    LegacyDB.add_hardcoded_codes()

    logging.info("Migrating codes")
    stats = LegacyDB.migrate_codes(dry_run=False)
    logging.info(pformat(stats))

    return stats


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_all_activities(self):
    logging.info("Importing all activities")
    stats = LegacyDB.migrate_activities(dry_run=False, clobber=True, source="all")
    logging.info(pformat(stats))
    return stats


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_activity_links(self):
    logging.info("Importing activity links")
    stats = LegacyDB.migrate_links()
    logging.info(pformat(stats))
    return stats


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def run_full_etl(self):
    c = chain(import_codes.si(), import_all_activities.si(), import_all_activities.si())
    c.apply_async()

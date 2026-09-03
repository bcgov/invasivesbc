import logging
from pprint import pformat

from api.legacy_db.db import LegacyDB
from api.legacy_db.migrate import parse_and_migrate_single_activity
from celery import chain
from invasivesbc import celery_app
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import psycopg
from psycopg.rows import dict_row


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_codes(self):
    logging.info("Adding hardcoded codes")
    LegacyDB.add_hardcoded_codes()

    logging.info("Migrating codes")
    stats = LegacyDB.migrate_codes(dry_run=False)
    logging.info(pformat(stats))

    return stats


@celery_app.task(bind=True, max_retries=3, time_limit=300)
def import_single_activity(self, activity_id: str, dry_run=False, clobber=False):
    return parse_and_migrate_single_activity(
        activity_id, dry_run=dry_run, clobber=clobber
    )


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 24)
def import_all_activities(self, clobber=True):
    logging.info("Importing all activities")

    with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
        with conn.cursor() as cursor:
            result = cursor.execute(
                "select activity_id from invasivesbc.activity_incoming_data where iscurrent=true and form_status like 'Submitted' and deleted_timestamp is NULL"
            )
            for row in result.fetchall():
                activity_id = row["activity_id"]
                import_single_activity.apply(
                    args=(activity_id,), kwargs={"dry_run": False, "clobber": clobber}
                )  # run it locally rather than as a background tasks. simplifies chaining/link creation.

    logging.info("run complete")


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_activity_links(self):
    logging.info("Importing activity links")
    stats = LegacyDB.migrate_links()
    logging.info(pformat(stats))
    return stats


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def run_full_etl(self, clobber=True):
    c = chain(
        import_codes.si(),
        import_all_activities.si(clobber=clobber),
        import_all_activities.si(),
    )
    c.apply_async()

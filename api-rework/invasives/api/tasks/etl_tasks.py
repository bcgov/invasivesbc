import logging
from pprint import pformat

import psycopg
from celery import chain
from psycopg.rows import dict_row

from api.legacy_db.db import LegacyDB
from api.legacy_db.migrate import (
    parse_and_migrate_single_activity,
    MigrationTaskResult,
    MigrationCumulativeTaskResult,
)
from invasivesbc import celery_app
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_codes(self):
    logging.info("Adding hardcoded codes")
    LegacyDB.add_hardcoded_codes()

    logging.info("Migrating codes")
    stats = LegacyDB.migrate_codes(dry_run=False)
    logging.info(pformat(stats))

    return stats


@celery_app.task(bind=True, max_retries=3, time_limit=300)
def import_single_activity(
    self, activity_id: str, dry_run=False, clobber=False
) -> MigrationTaskResult:
    return parse_and_migrate_single_activity(
        activity_id, dry_run=dry_run, clobber=clobber
    )


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 72)
def import_all_activities(self, clobber=True) -> MigrationCumulativeTaskResult:
    logging.info("Importing all activities")

    cumulative_result = MigrationCumulativeTaskResult()

    with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
        with conn.cursor() as cursor:
            result = cursor.execute(
                "select activity_id from invasivesbc.activity_incoming_data where iscurrent=true and form_status like 'Submitted' and deleted_timestamp is NULL"
            )
            for row in result.fetchall():
                activity_id = row["activity_id"]
                result = parse_and_migrate_single_activity(
                    activity_id, dry_run=False, clobber=clobber
                )
                cumulative_result.add(result)

    logging.info("run complete")
    logging.info(cumulative_result)
    return cumulative_result


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def import_activity_links(self):
    logging.info("Importing activity links")
    stats = LegacyDB.migrate_links()
    logging.info(pformat(stats))
    return stats


@celery_app.task(
    name="node_tasks.normalize_batch",
    bind=True,
    max_retries=3,
    time_limit=3600 * 12,
)
def normalize_batch(self, batch_id) -> MigrationCumulativeTaskResult:
    logging.info("Migrating Batch Upload")

    cumulative_result = MigrationCumulativeTaskResult()

    with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
        with conn.cursor() as cursor:
            result = cursor.execute(f"select activity_id \
                    from invasivesbc.activity_incoming_data \
                    where iscurrent=true and \
                    form_status like 'Submitted' and \
                    deleted_timestamp is NULL and \
                    batch_id = {str(int(batch_id))}")
            for row in result.fetchall():
                activity_id = row["activity_id"]
                result = parse_and_migrate_single_activity(
                    activity_id, dry_run=False, clobber=True
                )
                cumulative_result.add(result)

    logging.info(f"Migration complete for batch upload {batch_id}")
    logging.info(cumulative_result)
    return cumulative_result


@celery_app.task(
    name="node_tasks.normalize_legacy_record",
    bind=True,
    max_retries=3,
    time_limit=3600 * 12,
)
def normalize_legacy_record(self, activity_id):
    logging.info(f"Migrating single activity {activity_id}")
    result = parse_and_migrate_single_activity(activity_id, dry_run=False, clobber=True)
    logging.info(f"{activity_id} migrated.")
    return result


@celery_app.task(bind=True, max_retries=0, time_limit=3600 * 12)
def run_full_etl(self, clobber=True):
    c = chain(
        import_codes.si(),
        import_all_activities.si(clobber=clobber),
    )
    c.apply_async()


@celery_app.task(
    name="node_tasks.etl_updated_user",
    bind=True,
    max_retries=3,
    time_limit=3600 * 12,
)
def etl_updated_user(self):
    stats = LegacyDB.migrate_users()
    logging.info(pformat(stats))

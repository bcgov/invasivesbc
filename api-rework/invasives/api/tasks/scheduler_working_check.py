import logging

from invasivesbc import celery_app


@celery_app.task
def scheduler_working_check():
    logging.info("scheduled task running")

from api.models.activity import Activity
from api.tasks.export_classes.csv import CSV_ROW_MAP
from celery.utils.log import get_task_logger
from django.db import transaction
from invasivesbc import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, max_retries=3)
def build_csv_rows(self, record_id):
    with transaction.atomic():
        try:
            model = Activity.objects.get(id=record_id)
            export_class = CSV_ROW_MAP.get(model.subtype, None)
            if not export_class:
                logger.info(f"No Export Model for type: {model.subtype}")
                return
            export_class(record_id).start_conversion()
        except Exception as e:
            logger.error(e)
            raise e

import logging
from celery import group
from django.db.models import F, Q
from django.core.management.base import BaseCommand
from api.models.activity import Activity
from api.tasks.build_csv_rows import build_csv_rows
from api.models.export.csv import CSV_EXPORT_ROW_MAP

log = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update any missing/out-of-date Records in the CSV Export tables."

    def handle(self, *args, **options):
        combined_query = Q()
        for subtype, model in CSV_EXPORT_ROW_MAP.items():
            subtype_condition = Q(
                subtype=subtype,
            ) & (
                Q(**{f"{model._meta.model_name}__isnull": True})
                | Q(
                    **{
                        f"{model._meta.model_name}__last_exported__lt": F(
                            "created_timestamp"
                        )
                    }
                )
            )
            combined_query |= subtype_condition

        activities = Activity.objects.filter(combined_query).values_list(
            "id", flat=True
        )
        log.info(
            f"Found {len(activities)} activities out of date or missing in export tables."
        )
        group(build_csv_rows.s(str(id)) for id in activities).apply_async()

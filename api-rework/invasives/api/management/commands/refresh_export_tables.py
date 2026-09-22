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

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            help="Parse legacy entries only, do not copy into new database",
            action="store_true",
        )
        parser.add_argument(
            "--clobber",
            help="Overwrite previously-migrated activities (use with caution!)",
            action="store_true",
        )
        parser.add_argument(
            "--restrict-to-subtype",
            default=None,
            help="Restrict import to a particular subtype. Probably something like 'Activity_Observation_PlantTerrestrial'",
        )
        parser.add_argument(
            "pk",
            nargs="?",
            type=str,
            help="The primary key (UUID identifier) of the single activity to import",
        )

    def handle(self, *args, **options):
        combined_query = Q()

        target_subtypes = CSV_EXPORT_ROW_MAP

        if options["restrict_to_subtype"]:
            subtype = options["restrict_to_subtype"]
            model = CSV_EXPORT_ROW_MAP.get(subtype)
            if not model:
                raise Exception("Invalid Subtype was provided")
            target_subtypes = {subtype: model}

        if options["pk"] != None:
            combined_query = Q(activity_id__id=options["pk"])

        for subtype, model in target_subtypes.items():
            subtype_condition = Q(subtype=subtype)

            if not options.get("clobber", False):
                subtype_condition &= Q(
                    **{f"{model._meta.model_name}__isnull": True}
                ) | Q(
                    **{
                        f"{model._meta.model_name}__last_exported__lt": F(
                            "created_timestamp"
                        )
                    }
                )
            combined_query |= subtype_condition

        activities = Activity.objects.filter(combined_query).values_list(
            "id", flat=True
        )
        log.info(
            f"Found {len(activities)} activities out of date or missing in export tables."
        )
        group(build_csv_rows.s(str(id)) for id in activities).apply_async()

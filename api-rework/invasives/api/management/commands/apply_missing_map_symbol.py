import logging
from django.db.models import Q
from django.core.management.base import BaseCommand
from api.models.activity import Activity
from api.protocol.activity.activity_plant_row_out import ActivityPlantRowOut
from api.schemas.plant_activity.base_activity import BaseActivityProcessor
from django.db import transaction

log = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update any missing map_symbol records in the DB"

    def handle(self, *args, **options):
        with transaction.atomic():
            records_missing_map_symbol = Activity.objects.filter(
                Q(computed_map_symbol=None) | Q(computed_map_symbol="")
            ).distinct()

            count = len(records_missing_map_symbol)
            if count > 0:
                log.info(
                    f"Found {len(records_missing_map_symbol)} records missing computed_map_symbol. Updating..."
                )
                for record in records_missing_map_symbol:
                    BaseActivityProcessor.populate_map_symbol(
                        record, *ActivityPlantRowOut.get_plant_models(record)
                    )
                records_missing_map_symbol = (
                    Activity.objects.filter(
                        Q(computed_map_symbol=None) | Q(computed_map_symbol="")
                    )
                    .distinct()
                    .count()
                )

                log.info(
                    f"Updated missing records. {records_missing_map_symbol} Records remaining without computed_map_symbol"
                )
            else:
                log.info("No submitted records were found missing computed_map_symbol.")

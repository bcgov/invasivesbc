from . import BaseActivityProcessor
import logging
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    WellEntry,
    ChemicalTreatmentContext,
)

log = logging.getLogger(__name__)


class TreatmentChemicalTerrestrialIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        ChemicalTreatmentContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context")
        )
        WellEntry.objects.bulk_create(
            WellEntry(activity_data_record=adr, **well)
            for well in subtype_data.get("well_entries", [])
        )

        log.error(
            f"[{parent.short_id}] And attempt was made to create a {parent.subtype} activity. This has not been fully implemented, data loss will occur."
        )

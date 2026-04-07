import logging

from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import Activity, WellEntry, ActivityDataRecord


def add_well_information(new: Activity, old: LegacyActivity):
    if old.activity_payload.form_data.activity_subtype_data.Well_Information:
        for (
            well
        ) in old.activity_payload.form_data.activity_subtype_data.Well_Information:
            if well.well_id == "No wells found":
                logging.debug(
                    "Omitting empty well spec because of magic string well id = 'No wells found'"
                )
            else:
                adr = ActivityDataRecord.objects.create(activity=new)
                WellEntry.objects.update_or_create(
                    activity_data_record=adr,
                    well_tag=well.well_id,
                    distance=well.well_proximity,
                )

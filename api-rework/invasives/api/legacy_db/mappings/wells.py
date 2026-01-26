import logging
from pprint import pformat

from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import Activity


def add_well_information(new: Activity, old: LegacyActivity):
    if old.activity_payload.form_data.activity_subtype_data.Well_Information:
        for (
            well
        ) in old.activity_payload.form_data.activity_subtype_data.Well_Information:
            logging.warning(pformat(well))

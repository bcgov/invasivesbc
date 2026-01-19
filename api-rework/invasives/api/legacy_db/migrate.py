import logging

from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
)
from api.models.codes import (
    JurisdictionCode,
)
from api.models.enums import PlatformSource


def add_subtype_payload(new: Activity, old: LegacyActivity) -> None:
    # temporarily stripped out
    match new.subtype:
        case _:
            pass


def migrate(old: LegacyActivity):
    new = Activity()
    new.id = old.activity_id
    new.short_id = old.activity_payload.short_id
    new.type = old.activity_type
    new.subtype = old.activity_subtype.name
    new.access_description = (
        old.activity_payload.form_data.activity_data.access_description
    )
    new.date = old.activity_payload.form_data.activity_data.activity_date_time
    new.form_status = old.activity_payload.form_status
    new.comment = old.activity_payload.form_data.activity_data.general_comment

    new.created_by = old.activity_payload.created_by
    src_map = {
        "web": PlatformSource.Web.value,
        "ios": PlatformSource.Ios.value,
        "android": PlatformSource.Android.value,
    }

    new.creating_platform = src_map.get(
        old.activity_payload.platform_src, PlatformSource.Unknown.value
    )
    new.batch_id = old.activity_payload.batch_id

    # pprint(old)

    new.latitude = old.activity_payload.form_data.activity_data.latitude
    new.longitude = old.activity_payload.form_data.activity_data.longitude
    new.utm_zone = old.activity_payload.form_data.activity_data.utm_zone
    new.utm_easting = old.activity_payload.form_data.activity_data.utm_easting
    new.utm_northing = old.activity_payload.form_data.activity_data.utm_northing

    # If Activity is not saved first, we cannot link other records to it.
    new.save()

    if (
        old.activity_payload.form_data.activity_type_data.linked_id is not None
        and old.activity_payload.form_data.activity_type_data.linked_id != ""
    ):
        logging.warning(
            "linked_id: %s", old.activity_payload.form_data.activity_type_data.linked_id
        )
        try:
            new.linked_activities.add(
                Activity.objects.get(
                    activity_id=old.activity_payload.form_data.activity_type_data.linked_id
                )
            )
        except Activity.DoesNotExist:
            # @todo add to errors object
            logging.warning("Linked activity does not exist")

    # re-save
    new.save()

    if old.activity_payload.form_data.activity_data.jurisdictions:
        for jurisdiction in old.activity_payload.form_data.activity_data.jurisdictions:
            jur_code = JurisdictionCode.objects.get(code=jurisdiction.jurisdiction_code)
            if jur_code:
                new.jurisdiction_set.update_or_create(
                    jurisdiction=jur_code, percent_covered=jurisdiction.percent_covered
                )

    st = old.activity_payload.form_data.activity_subtype_data

    add_subtype_payload(new, old)

    new.save()

    return new

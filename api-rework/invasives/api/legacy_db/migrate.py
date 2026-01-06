from api.legacy_db.model_serializer import LegacyActivity
from api.models import ActivityBasic, ActivitySubtypeCode


def migrate(old: LegacyActivity):
    new = ActivityBasic()
    new.activity_id = old.activity_id
    new.short_id = old.activity_payload.short_id
    new.activity_type = old.activity_type
    new.activity_subtype = ActivitySubtypeCode.objects.get_or_create(
        code=old.activity_subtype.value,
        defaults={
            "code": old.activity_subtype.value,
            "full": old.activity_subtype.value,
        },
    )[0]
    new.access_description = (
        old.activity_payload.form_data.activity_data.access_description
    )
    new.activity_date = old.activity_payload.form_data.activity_data.activity_date_time
    new.form_status = old.activity_payload.form_status
    new.comment = old.activity_payload.form_data.activity_data.general_comment

    new.created_by = old.activity_payload.created_by

    return new

from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    Participant,
    ActivityDataRecord,
    ActivitySubtypes,
)


def add_persons(
    new: Activity,
    old: LegacyActivity,
):
    adr = ActivityDataRecord.objects.create(activity=new)

    for person in old.activity_payload.form_data.activity_type_data.activity_persons:
        is_chem_treatment = old.activity_subtype in [
            ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial,
            ActivitySubtypes.Treatment_Chemical_Plant_Aquatic,
        ]
        Participant.objects.create(
            activity_data_record=adr,
            name=person.person_name,
            pac_number=str(person.applicator_license) if is_chem_treatment else None,
        )

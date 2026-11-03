import uuid, json
from pydantic import TypeAdapter, ValidationError
from django.contrib.gis.geos import GEOSGeometry
from api.models.activity import ActivitySubtypes
from api.models.auth import User
from api.tests.factories.common import (
    build_user,
)
from api.tests.factories.plants.subtypes import (
    build_observation_plant_terrestrial,
)
from api.schemas.plant_activity import ACTIVITY_PROCESSORS
from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema

adapter = TypeAdapter(PlantActivitySchema)


def create_plant_record(
    subtype: ActivitySubtypes, subject: str, form_id: uuid.UUID = uuid.uuid4()
):
    user, _ = User.objects.get_or_create(
        subject=subject, defaults={"display_name": build_user()}
    )
    MAP = {
        ActivitySubtypes.Observation_Plant_Terrestrial.name: build_observation_plant_terrestrial
    }
    if mock := MAP.get(subtype.name, None):
        record = adapter.validate_python(
            mock(subtype=subtype, subject=user, form_id=form_id)
        ).model_dump(mode="python", exclude_unset=True)
        processor = ACTIVITY_PROCESSORS.get(subtype.name)
        print("Second Last")
        shape_data = record.get("shape")
        if shape_data:
            geometry_dict = shape_data.get("geometry", shape_data)
            record["shape"] = GEOSGeometry(json.dumps(geometry_dict))
        return processor.process(payload=record, instance=None)

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
    build_observation_plant_aquatic,
)
from api.schemas.plant_activity import ACTIVITY_PROCESSORS
from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema

adapter = TypeAdapter(PlantActivitySchema)


def create_plant_record(subtype: ActivitySubtypes, subject: str):
    user, _ = User.objects.get_or_create(
        subject=subject, defaults={"display_name": build_user()}
    )
    MAP = {
        ActivitySubtypes.Observation_Plant_Terrestrial.name: build_observation_plant_terrestrial,
        ActivitySubtypes.Observation_Plant_Aquatic.name: build_observation_plant_aquatic,
    }
    if mock := MAP.get(subtype.name, None):
        record = adapter.validate_python(
            mock(subtype=subtype, subject=user, form_id=uuid.uuid4())
        ).model_dump(mode="python", exclude_unset=True)
        processor = ACTIVITY_PROCESSORS.get(subtype.name)

        shape_data = record.get("shape")
        if shape_data:
            geometry_dict = shape_data.get("geometry", shape_data)
            record["shape"] = GEOSGeometry(json.dumps(geometry_dict))
        return processor.process(payload=record, instance=None)

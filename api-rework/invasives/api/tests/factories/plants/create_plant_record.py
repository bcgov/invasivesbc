import uuid, json
from pydantic import TypeAdapter
from django.contrib.gis.geos import GEOSGeometry
from api.models.activity import ActivitySubtypes
from api.models.auth import User
from api.tests.factories.common import (
    build_user,
)
from api.tests.factories.plants.subtypes import (
    build_observation_plant_terrestrial,
    build_observation_plant_aquatic,
    build_treatment_mechanical_terrestrial,
    build_treatment_mechanical_aquatic,
    build_monitoring_mechanical_treatment,
    build_monitoring_chemical_treatment,
    build_treatment_chemical_terrestrial,
    build_treatment_chemical_aquatic,
    build_biocontrol_release,
    build_biocontrol_collection,
    build_biocontrol_dispersal_monitoring,
)
from api.schemas.plant_activity import ACTIVITY_PROCESSORS
from api.models.activity import Activity
from typing import Optional
from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema

adapter = TypeAdapter(PlantActivitySchema)


def build_plant_record(
    subtype: ActivitySubtypes, subject: str, *linking_activities: Optional[Activity]
):
    """
    Given a user and Subtype, generate a mock Plant Activity.
    Leverages the Pydantic Plant Schema + Protocols for creation handling.
    """

    # Get or create new user from subject
    user, _ = User.objects.get_or_create(
        subject=subject, defaults={"display_name": build_user()}
    )
    # Map Subtypes to builders
    MAP = {
        ActivitySubtypes.Observation_Plant_Terrestrial.name: build_observation_plant_terrestrial,
        ActivitySubtypes.Observation_Plant_Aquatic.name: build_observation_plant_aquatic,
        ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: build_treatment_mechanical_aquatic,
        ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: build_treatment_mechanical_terrestrial,
        ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: build_monitoring_chemical_treatment,
        ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: build_monitoring_mechanical_treatment,
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: build_treatment_chemical_terrestrial,
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: build_treatment_chemical_aquatic,
        ActivitySubtypes.Biocontrol_Release.name: build_biocontrol_release,
        ActivitySubtypes.Biocontrol_Collection.name: build_biocontrol_collection,
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: build_biocontrol_dispersal_monitoring,
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: build_biocontrol_dispersal_monitoring,
    }
    if mock := MAP.get(subtype.name, None):
        # Cast to adapter (Which our submission API uses)
        record = adapter.validate_python(
            mock(subtype=subtype, subject=user, form_id=uuid.uuid4())
        ).model_dump(mode="python", exclude_unset=True)
        # Prep Processor
        processor = ACTIVITY_PROCESSORS.get(subtype.name)
        # Process Shape to comply
        shape_data = record.get("shape")
        if shape_data:
            geometry_dict = shape_data.get("geometry", shape_data)
            record["shape"] = GEOSGeometry(json.dumps(geometry_dict))
        # Handle Activity Processing (Creation)
        return processor.process(payload=record, instance=None)

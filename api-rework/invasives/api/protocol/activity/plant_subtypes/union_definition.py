from typing import Union, Annotated
from pydantic import Field
from api.protocol.activity.plant_subtypes.observation_terrestrial import ObservationTerrestrialSchema
from api.protocol.activity.plant_subtypes.observation_aquatic import ObservationAquaticSchema


PlantActivitySchema = Annotated[
    Union[
        ObservationTerrestrialSchema,
        ObservationAquaticSchema
    ],
    Field(discriminator="subtype")
]

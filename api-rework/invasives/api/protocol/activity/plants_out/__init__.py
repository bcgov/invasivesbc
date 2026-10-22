from .base import BaseRecordOut, DraftBaseRecordOut

from pydantic import Field
from typing import Union, Annotated

from .observation_terrestrial import (
    ObservationTerrestrialPlantOut,
    DraftObservationTerrestrialPlantOut,
)

PlantRecordOut = Union[
    DraftObservationTerrestrialPlantOut,
    ObservationTerrestrialPlantOut,
]

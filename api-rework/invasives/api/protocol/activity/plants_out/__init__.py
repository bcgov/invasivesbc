from django.db.models import Model
from typing import Union, List


def _get_codes(model: Model, adr, field: str) -> List[str] | List[int]:
    """Handler for Parsing back a list of values"""
    return list(
        model.objects.filter(activity_data_record=adr).values_list(field, flat=True)
    )


from .base import BaseRecordOut, DraftBaseRecordOut

from .observation_terrestrial import (
    ObservationTerrestrialPlantOut,
    DraftObservationTerrestrialPlantOut,
)
from .observation_aquatic import (
    ObservationAquaticPlantOut,
    DraftObservationAquaticPlantOut,
)

PlantRecordOut = Union[
    ObservationTerrestrialPlantOut,
    ObservationAquaticPlantOut,
    DraftObservationTerrestrialPlantOut,
    DraftObservationAquaticPlantOut,
]

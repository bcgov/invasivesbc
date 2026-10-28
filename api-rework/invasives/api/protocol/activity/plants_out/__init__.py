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
from .treatment_mechanical_aquatic import (
    TreatmentMechanicalAquaticPlantOut,
    DraftTreatmentMechanicalAquaticPlantOut,
)
from .treatment_mechanical_terrestrial import (
    TreatmentMechanicalTerrestrialPlantOut,
    DraftTreatmentMechanicalTerrestrialPlantOut,
)
from .monitoring_treatment_chemical import (
    MonitoringTreatmentChemicalOut,
    DraftMonitoringTreatmentChemicalOut,
)

from .monitoring_treatment_mechanical import (
    MonitoringTreatmentMechanicalOut,
    DraftMonitoringTreatmentMechanicalOut,
)
from .biocontrol_release import (
    BiocontrolReleaseOut,
    DraftBiocontrolReleaseOut,
)
from .biocontrol_collection import (
    BiocontrolCollectionOut,
    DraftBiocontrolCollectionOut,
)

PlantRecordOut = Union[
    ObservationTerrestrialPlantOut,
    ObservationAquaticPlantOut,
    DraftObservationTerrestrialPlantOut,
    DraftObservationAquaticPlantOut,
    TreatmentMechanicalAquaticPlantOut,
    DraftTreatmentMechanicalAquaticPlantOut,
    TreatmentMechanicalTerrestrialPlantOut,
    DraftTreatmentMechanicalTerrestrialPlantOut,
    MonitoringTreatmentChemicalOut,
    DraftMonitoringTreatmentChemicalOut,
    MonitoringTreatmentMechanicalOut,
    DraftMonitoringTreatmentMechanicalOut,
    BiocontrolReleaseOut,
    DraftBiocontrolReleaseOut,
    BiocontrolCollectionOut,
    DraftBiocontrolCollectionOut,
]

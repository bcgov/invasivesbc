from django.db.models import Model
from typing import Union, List
from datetime import datetime


def _get_codes(model: Model, adr, field: str) -> List[str] | List[int]:
    """Handler for Parsing back a list of values"""
    return model.objects.filter(activity_data_record=adr).values_list(field, flat=True)


def _serialize_html_date_time(time: datetime):
    """
    Formats the datetime into YYYY-MM-DDTHH:MM:SS format
    stripping out any timezone 'Z' or offset so HTML date inputs accept it.
    """
    return time.strftime("%Y-%m-%dT%H:%M:%S") if time else None


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
from .biocontrol_release_monitoring import (
    BiocontrolReleaseMonitoringOut,
    DraftBiocontrolReleaseMonitoringOut,
)
from .biocontrol_dispersal_monitoring import (
    BiocontrolDispersalMonitoringOut,
    DraftBiocontrolDispersalMonitoringOut,
)
from .treatment_chemical_terrestrial import (
    TreatmentChemicalTerrestrialOut,
    DraftTreatmentChemicalTerrestrialOut,
)
from .treatment_chemical_aquatic import (
    TreatmentChemicalAquaticOut,
    DraftTreatmentChemicalAquaticOut,
)

PlantRecordOut = Union[
    # Observation
    ObservationTerrestrialPlantOut,
    ObservationAquaticPlantOut,
    DraftObservationTerrestrialPlantOut,
    DraftObservationAquaticPlantOut,
    # Treatments
    TreatmentMechanicalAquaticPlantOut,
    TreatmentMechanicalTerrestrialPlantOut,
    TreatmentChemicalTerrestrialOut,
    TreatmentChemicalAquaticOut,
    DraftTreatmentMechanicalAquaticPlantOut,
    DraftTreatmentMechanicalTerrestrialPlantOut,
    DraftTreatmentChemicalTerrestrialOut,
    DraftTreatmentChemicalAquaticOut,
    # Monitoring
    MonitoringTreatmentChemicalOut,
    MonitoringTreatmentMechanicalOut,
    DraftMonitoringTreatmentChemicalOut,
    DraftMonitoringTreatmentMechanicalOut,
    # Biocontrol
    BiocontrolReleaseOut,
    BiocontrolCollectionOut,
    BiocontrolReleaseMonitoringOut,
    BiocontrolDispersalMonitoringOut,
    DraftBiocontrolReleaseOut,
    DraftBiocontrolCollectionOut,
    DraftBiocontrolReleaseMonitoringOut,
    DraftBiocontrolDispersalMonitoringOut,
]

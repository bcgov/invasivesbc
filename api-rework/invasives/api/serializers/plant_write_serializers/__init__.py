from api.models.activity import ActivitySubtypes
from .base_activity import ActivityWriteSerializer
from .observation_terrestrial import ObservationTerrestrialWriteSerializer
from .observation_aquatic import ObservationAquaticWriteSerializer
from .monitoring_chemical_mechanical_treatment import (
    MonitoringChemicalMechanicalWriteSerializer,
)
from .treatment_mechanical_aquatic import TreatmentMechanicalAquaticWriteSerializer
from .treatment_mechanical_terrestrial import (
    TreatmentMechanicalTerrestrialWriteSerializer,
)
from .biocontrol_release import BiocontrolReleaseWriteSerializer

WRITE_SERIALIZERS = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: ObservationTerrestrialWriteSerializer,
    ActivitySubtypes.Observation_Plant_Aquatic.name: ObservationAquaticWriteSerializer,
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: TreatmentMechanicalTerrestrialWriteSerializer,
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: TreatmentMechanicalAquaticWriteSerializer,
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: MonitoringChemicalMechanicalWriteSerializer,
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: MonitoringChemicalMechanicalWriteSerializer,
    ActivitySubtypes.Biocontrol_Release.name: BiocontrolReleaseWriteSerializer,
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: ObservationTerrestrialWriteSerializer,
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: ObservationTerrestrialWriteSerializer,
    ActivitySubtypes.Biocontrol_Collection.name: ObservationTerrestrialWriteSerializer,
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: ObservationTerrestrialWriteSerializer,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: ObservationTerrestrialWriteSerializer,
}

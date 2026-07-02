from api.models.activity import ActivitySubtypes
from .base_activity import BaseActivityProcessor, DraftBaseActivityProcessor
from .observation_terrestrial import (
    PlantObservationTerrestrialIn,
    DraftPlantObservationTerrestrialIn,
)
from .observation_aquatic import (
    PlantObservationAquaticIn,
    DraftPlantObservationAquaticIn,
)
from .treatment_mechanical_terrestrial import (
    PlantTreatmentMechanicalTerrestrialIn,
    DraftPlantTreatmentMechanicalTerrestrialIn,
)
from .treatment_mechanical_aquatic import (
    PlantTreatmentMechanicalAquaticIn,
    DraftPlantTreatmentMechanicalAquaticIn,
)
from .monitoring_mechanical import (
    PlantMonitoringMechanicalIn,
    DraftPlantMonitoringMechanicalIn,
)
from .monitoring_chemical import (
    PlantMonitoringChemicalIn,
    DraftPlantMonitoringChemicalIn,
)
from .biocontrol_release import BiocontrolReleaseIn, DraftBiocontrolReleaseIn
from .biocontrol_collection import BiocontrolCollectionIn, DraftBiocontrolCollectionIn
from .monitoring_biocontrol_release import (
    MonitoringBiocontrolReleaseIn,
    DraftMonitoringBiocontrolReleaseIn,
)
from .monitoring_biocontrol_dispersal import (
    MonitoringBiocontrolDispersalIn,
    DraftMonitoringBiocontrolDispersalIn,
)
from .treatment_chemical_terrestrial import (
    TreatmentChemicalTerrestrialIn,
    DraftTreatmentChemicalTerrestrialIn,
)
from .treatment_chemical_aquatic import (
    TreatmentChemicalAquaticIn,
    DraftTreatmentChemicalAquaticIn,
)

ACTIVITY_PROCESSORS = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: PlantObservationTerrestrialIn,
    ActivitySubtypes.Observation_Plant_Aquatic.name: PlantObservationAquaticIn,
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: PlantTreatmentMechanicalTerrestrialIn,
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: PlantTreatmentMechanicalAquaticIn,
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: PlantMonitoringMechanicalIn,
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: PlantMonitoringChemicalIn,
    ActivitySubtypes.Biocontrol_Release.name: BiocontrolReleaseIn,
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: MonitoringBiocontrolReleaseIn,
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: MonitoringBiocontrolDispersalIn,
    ActivitySubtypes.Biocontrol_Collection.name: BiocontrolCollectionIn,
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: TreatmentChemicalAquaticIn,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: TreatmentChemicalTerrestrialIn,
}

DRAFT_ACTIVITY_PROCESSORS = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: DraftPlantObservationTerrestrialIn,
    ActivitySubtypes.Observation_Plant_Aquatic.name: DraftPlantObservationAquaticIn,
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: DraftPlantTreatmentMechanicalTerrestrialIn,
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: DraftPlantTreatmentMechanicalAquaticIn,
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: DraftPlantMonitoringMechanicalIn,
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: DraftPlantMonitoringChemicalIn,
    ActivitySubtypes.Biocontrol_Release.name: DraftBiocontrolReleaseIn,
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: DraftMonitoringBiocontrolReleaseIn,
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: DraftMonitoringBiocontrolDispersalIn,
    ActivitySubtypes.Biocontrol_Collection.name: DraftBiocontrolCollectionIn,
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: DraftTreatmentChemicalAquaticIn,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: DraftTreatmentChemicalTerrestrialIn,
}

from api.models.activity import ActivitySubtypes
from typing import Type
from .base import BaseCsvExportModel
from .observation_pa import ObservationPlantAquatic
from .observation_pt import ObservationPlantTerrestrial
from .treatment_mech_pa import TreatmentMechanicalPlantAquatic
from .treatment_mech_pt import TreatmentMechanicalPlantTerrestrial
from .treatment_chem_pa import TreatmentChemicalPlantAquatic
from .treatment_chem_pt import TreatmentChemicalPlantTerrestrial
from .treatment_biocontrol_release import TreatmentBiocontrolReleasePlant
from .monitoring_chemical_p import MonitoringChemicalPlant
from .monitoring_mechanical_p import MonitoringMechanicalPlant
from .monitoring_biocontrol_release import MonitoringBiocontrolReleasePlant
from .biocontrol_dispersal_monitoring import MonitoringBiocontrolDispersal
from .biocontrol_collection import BiocontrolCollectionPlant

CSV_EXPORT_ROW_MAP: dict[str, Type[BaseCsvExportModel]] = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: ObservationPlantTerrestrial,
    ActivitySubtypes.Observation_Plant_Aquatic.name: ObservationPlantAquatic,
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: TreatmentChemicalPlantAquatic,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: TreatmentChemicalPlantTerrestrial,
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: TreatmentMechanicalPlantAquatic,
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: TreatmentMechanicalPlantTerrestrial,
    ActivitySubtypes.Biocontrol_Release.name: TreatmentBiocontrolReleasePlant,
    ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: MonitoringMechanicalPlant,
    ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: MonitoringChemicalPlant,
    ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: MonitoringBiocontrolReleasePlant,
    ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: MonitoringBiocontrolDispersal,
    ActivitySubtypes.Biocontrol_Collection.name: BiocontrolCollectionPlant,
}

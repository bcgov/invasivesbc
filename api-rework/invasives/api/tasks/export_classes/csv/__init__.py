from typing import Type
from api.models.activity import ActivitySubtypes
from .common import CsvTransformerBase
from .observation_pt import ObservationPlantTerrestrialCsvRow
from .observation_pa import ObservationPlantAquaticCsvRow
from .treatment_chem_pt import TreatmentChemicalPlantTerrestrialCsvRow
from .treatment_chem_pa import TreatmentChemicalPlantAquaticCsvRow
from .treatment_mech_pt import TreatmentMechanicalPlantTerrestrialCsvRow
from .treatment_mech_pa import TreatmentMechanicalPlantAquaticCsvRow
from .treatment_biocontrol_release import TreatmentBiocontrolReleasePlantCsvRow

CSV_ROW_MAP: dict[str, Type[CsvTransformerBase]] = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: ObservationPlantTerrestrialCsvRow,
    ActivitySubtypes.Observation_Plant_Aquatic.name: ObservationPlantAquaticCsvRow,
    ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: TreatmentChemicalPlantAquaticCsvRow,
    ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: TreatmentChemicalPlantTerrestrialCsvRow,
    ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: TreatmentMechanicalPlantAquaticCsvRow,
    ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: TreatmentMechanicalPlantTerrestrialCsvRow,
    ActivitySubtypes.Biocontrol_Release.name: TreatmentBiocontrolReleasePlantCsvRow,
}

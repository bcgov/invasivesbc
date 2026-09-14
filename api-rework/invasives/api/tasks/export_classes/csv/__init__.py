from typing import Type
from api.models.activity import ActivitySubtypes
from .common import CsvTransformerBase
from .observation_pt import ObservationPlantTerrestrialCsvRow
from .observation_pa import ObservationPlantAquaticCsvRow

CSV_ROW_MAP: dict[str, Type[CsvTransformerBase]] = {
    ActivitySubtypes.Observation_Plant_Terrestrial.name: ObservationPlantTerrestrialCsvRow,
    ActivitySubtypes.Observation_Plant_Aquatic.name: ObservationPlantAquaticCsvRow,
}

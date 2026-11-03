import uuid, random
from api.models.activity import ActivitySubtypes
from api.tests.factories.plants.common import build_mock_base

from api.models.enums import PlantDisposalFormat
from api.tests.factories.helpers import rand_code
from api.models.codes import (
    TerrestrialPlantCode,
    PlantMechanicalTreatmentMethodCode,
    DisposalMethodCode,
)


def build_entries():
    plants = set()
    for _ in range(4):
        plants.add(rand_code(TerrestrialPlantCode))
    entries = []
    for plant in plants:
        entries.append(
            {
                "disposed_material_amount": random.randint(5, 100),
                "disposed_material_format": random.choice(
                    list(PlantDisposalFormat)
                ).value,
                "disposal_method": rand_code(model=DisposalMethodCode),
                "invasive_plant": plant,
                "mechanical_method": rand_code(
                    model=PlantMechanicalTreatmentMethodCode
                ),
                "treated_area_msq": random.randint(5, 100),
            }
        )
    return entries


def build_treatment_mechanical_terrestrial(
    subject, subtype: ActivitySubtypes, linking_activities, form_id: uuid = uuid.uuid4()
):
    return {
        **build_mock_base(
            subject=subject,
            subtype=subtype,
            linking_activities=linking_activities,
            form_id=form_id,
        ),
        "subtype_data": {
            "entries": build_entries(),
        },
    }
